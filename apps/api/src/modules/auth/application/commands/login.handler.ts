import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { authenticator } from 'otplib'
import { and, eq } from 'drizzle-orm'
import {
  getDb,
  users as usersTable,
  tenants as tenantsTable,
  naturalPersonProfiles,
  roles,
  userRoles,
} from '@crm/database'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { Session } from '../../domain/entities/session.entity'
import { MfaMethod } from '../../domain/entities/mfa-method.entity'
import { LoginCommand } from './auth.commands'
import { UserLoggedInEvent } from '../../domain/events/auth.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { UserLookupService } from './user-lookup.service'

@Injectable()
export class LoginHandler {
  private readonly logger = new Logger(LoginHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
    private readonly jwtService: JwtService,
    private readonly userLookup: UserLookupService,
  ) {}

  async execute(command: LoginCommand) {
    const cleanEmail = command.email.trim().toLowerCase()
    let user = await this.userLookup.findByTenantAndEmail(command.tenantId, cleanEmail)
    let actualTenantId = command.tenantId

    if (!user && this.userLookup.findByEmail) {
      const found = await this.userLookup.findByEmail(cleanEmail)
      if (found) {
        user = found
        if (found.tenantId) actualTenantId = found.tenantId
      }
    }

    if (!user && process.env.DATABASE_URL) {
      try {
        const db = getDb()
        const found = await db.query.users.findFirst({
          where: eq(usersTable.email, cleanEmail) as any,
        })
        if (found) {
          user = {
            id: found.id,
            email: found.email,
            passwordHash: found.passwordHash,
          }
          actualTenantId = found.tenantId
        }
      } catch {
        // Safe fallback in test environments
      }
    }

    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(command.password, user.passwordHash ?? '')
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    const mfaMethods = await this.repo.findMfaMethodsByUser(actualTenantId, user.id)
    const activeMfa = mfaMethods.find((m) => m.isActive)
    const mfaRequired = !!activeMfa

    if (mfaRequired && command.mfaCode) {
      const verified = await this.verifyMfaCode(activeMfa!, command.mfaCode, actualTenantId, user.id)
      if (!verified) throw new UnauthorizedException('Invalid MFA code')
    }

    const userRoleNames = await this.findRoleNames(actualTenantId, user.id)
    const tokens = await this.generateTokens(actualTenantId, user.id, user.email, userRoleNames)
    const session = Session.create({
      tenantId: actualTenantId,
      userId: user.id,
      refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
      deviceId: command.deviceId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    await this.repo.saveSession(session)
    await this.outbox.publish(new UserLoggedInEvent(user.id, actualTenantId, session.id))

    this.logger.log(`User ${user.id} logged in for tenant ${actualTenantId}`)

    let userName = user.email
    let companyName = 'Mi Empresa'

    if (process.env.DATABASE_URL) {
      try {
        const db = getDb()
        const userRec = await db.query.users.findFirst({
          where: eq(usersTable.id, user.id) as any,
        })
        if (userRec?.profileId) {
          const profile = await db.query.naturalPersonProfiles.findFirst({
            where: eq(naturalPersonProfiles.id, userRec.profileId) as any,
          })
          if (profile) {
            userName = `${profile.firstName} ${profile.lastName}`.trim()
          }
        }
        const tenantRec = await db.query.tenants.findFirst({
          where: eq(tenantsTable.id, actualTenantId) as any,
        })
        if (tenantRec?.name) {
          companyName = tenantRec.name
        }
      } catch {
        // Safe fallback
      }
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: session.id,
      mfaRequired: mfaRequired && !command.mfaCode,
      user: {
        id: user.id,
        email: user.email,
        name: userName,
        tenantId: actualTenantId,
        companyName,
      },
    }
  }

  private async findRoleNames(tenantId: string, userId: string): Promise<string[]> {
    if (!process.env.DATABASE_URL) return []

    try {
      const db = getDb()
      const assignedRoles = await db
        .select({ name: roles.name })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(and(eq(userRoles.userId, userId), eq(userRoles.tenantId, tenantId)))

      return assignedRoles.map((role) => role.name).filter(Boolean)
    } catch (error) {
      this.logger.warn(`Unable to load roles for user ${userId}: ${error}`)
      return []
    }
  }

  private async verifyMfaCode(method: MfaMethod, code: string, tenantId: string, userId: string): Promise<boolean> {
    if (method.type === 'TOTP') {
      try {
        return authenticator.verify({ token: code, secret: method.secret })
      } catch (error) {
        this.logger.error(`TOTP verification failed for user ${userId}: ${error}`)
        return false
      }
    }

    if (method.type === 'SMS' || method.type === 'EMAIL') {
      return bcrypt.compare(code, method.secret)
    }

    const codes = await this.repo.findUnusedRecoveryCodesByUser(userId)
    for (const rc of codes) {
      if (await bcrypt.compare(code, rc.codeHash)) {
        await this.repo.saveRecoveryCode(rc.markAsUsed())
        return true
      }
    }

    return false
  }

  private async generateTokens(tenantId: string, userId: string, email: string, roleNames: string[]) {
    const payload = {
      sub: userId,
      tenantId,
      email,
      roles: roleNames,
      ...(roleNames[0] ? { role: roleNames[0] } : {}),
    }
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' })
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' })
    return { accessToken, refreshToken }
  }
}
