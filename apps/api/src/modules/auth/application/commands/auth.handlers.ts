import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConflictError, NotFoundError } from '@crm/shared'
import * as bcrypt from 'bcrypt'
import { authenticator } from 'otplib'
import { eq } from 'drizzle-orm'
import { getDb, users as usersTable, tenants as tenantsTable, naturalPersonProfiles } from '@crm/database'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { Session } from '../../domain/entities/session.entity'
import { MfaMethod } from '../../domain/entities/mfa-method.entity'
import { MfaRecoveryCode } from '../../domain/entities/mfa-recovery-code.entity'
import { PasswordPolicy } from '../../domain/entities/password-policy.entity'
import { PasswordHistory } from '../../domain/entities/password-history.entity'
import { IpRestriction } from '../../domain/entities/ip-restriction.entity'
import { OAuthProvider } from '../../domain/entities/oauth-provider.entity'
import {
  LoginCommand, RefreshTokenCommand, LogoutCommand, ChangePasswordCommand,
  SetupMfaCommand, VerifyMfaCommand, GetRecoveryCodesCommand, RegenerateRecoveryCodesCommand,
  UpdatePasswordPolicyCommand, CreateIpRestrictionCommand, DeleteIpRestrictionCommand,
  RevokeSessionCommand, CreateOAuthProviderCommand, DeleteOAuthProviderCommand,
} from './auth.commands'
import {
  UserLoggedInEvent, UserLoggedOutEvent, SessionRevokedEvent, PasswordChangedEvent,
  MfaSetupEvent, MfaVerifiedEvent,
} from '../../domain/events/auth.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

export interface UserLookup {
  id: string
  email: string
  passwordHash: string | null
}

export abstract class UserLookupService {
  abstract findByTenantAndEmail(tenantId: string, email: string): Promise<UserLookup | null>
  abstract findById(tenantId: string, userId: string): Promise<Pick<UserLookup, 'id' | 'passwordHash'> | null>
  findByEmail?(email: string): Promise<(UserLookup & { tenantId?: string }) | null>
}

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
    const activeMfa = mfaMethods.find(m => m.isActive)
    const mfaRequired = !!activeMfa

    if (mfaRequired && command.mfaCode) {
      const verified = await this.verifyMfaCode(activeMfa!, command.mfaCode, actualTenantId, user.id)
      if (!verified) throw new UnauthorizedException('Invalid MFA code')
    }

    const tokens = await this.generateTokens(actualTenantId, user.id, user.email)
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

  private async generateTokens(tenantId: string, userId: string, email: string) {
    const payload = { sub: userId, tenantId, email }
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' })
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' })
    return { accessToken, refreshToken }
  }
}

@Injectable()
export class RefreshTokenHandler {
  private readonly logger = new Logger(RefreshTokenHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RefreshTokenCommand) {
    let payload: { sub: string; tenantId: string; email: string }
    try {
      payload = await this.jwtService.verifyAsync(command.refreshToken)
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (payload.tenantId !== command.tenantId) {
      throw new UnauthorizedException('Tenant mismatch')
    }

    const sessions = await this.repo.listSessionsByUser(command.tenantId, payload.sub)
    let session = null

    for (const candidate of sessions) {
      if (candidate.isRevoked || candidate.isExpired()) continue
      const matches = await bcrypt.compare(command.refreshToken, candidate.refreshTokenHash)
      if (matches) {
        session = candidate
        break
      }
    }

    if (!session) {
      throw new UnauthorizedException('Session invalid or expired')
    }

    const tokens = await this.generateTokens(command.tenantId, payload.sub, payload.email)

    const newSession = Session.create({
      tenantId: command.tenantId,
      userId: payload.sub,
      refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    await this.repo.saveSession(newSession)
    await this.repo.saveSession(session.revoke())

    this.logger.log(`Token refreshed for user ${payload.sub}`)

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: newSession.id,
    }
  }

  private async generateTokens(tenantId: string, userId: string, email: string) {
    const payload = { sub: userId, tenantId, email }
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' })
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' })
    return { accessToken, refreshToken }
  }
}

@Injectable()
export class LogoutHandler {
  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const session = await this.repo.findSessionById(command.sessionId)
    if (!session) throw new NotFoundError('Session', command.sessionId)

    const revoked = session.revoke()
    await this.repo.saveSession(revoked)
    await this.outbox.publish(new UserLoggedOutEvent(session.userId, command.sessionId))
  }
}

@Injectable()
export class ChangePasswordHandler {
  private readonly logger = new Logger(ChangePasswordHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
    private readonly userLookup: UserLookupService,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const user = await this.userLookup.findById(command.tenantId, command.userId)
    if (!user) throw new NotFoundError('User', command.userId)

    const valid = await bcrypt.compare(command.currentPassword, user.passwordHash ?? '')
    if (!valid) throw new UnauthorizedException('Current password is incorrect')

    const policy = await this.repo.getPasswordPolicy(command.tenantId)
    const effectivePolicy = policy ?? PasswordPolicy.default(command.tenantId)
    const errors = effectivePolicy.validate(command.newPassword)
    if (errors.length > 0) throw new BadRequestException(errors.join('; '))

    const history = await this.repo.findPasswordHistoryByUser(command.userId, effectivePolicy.preventReuseLastN)
    for (const entry of history) {
      if (await bcrypt.compare(command.newPassword, entry.passwordHash)) {
        throw new BadRequestException('Password has been used recently')
      }
    }

    const newHash = await bcrypt.hash(command.newPassword, 10)
    const historyEntry = PasswordHistory.create({ userId: command.userId, passwordHash: newHash })
    await this.repo.savePasswordHistory(historyEntry)
    await this.outbox.publish(new PasswordChangedEvent(command.userId))

    this.logger.log(`Password changed for user ${command.userId}`)
  }
}

@Injectable()
export class SetupMfaHandler {
  private readonly logger = new Logger(SetupMfaHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: SetupMfaCommand) {
    const existing = await this.repo.findMfaMethodsByUser(command.tenantId, command.userId)
    for (const m of existing) {
      if (m.type === command.type && m.isActive) {
        throw new ConflictError(`MFA method ${command.type} already active`)
      }
    }

    let secret: string
    let backupCode: string | undefined

    if (command.type === 'TOTP') {
      secret = authenticator.generateSecret()
    } else if (command.type === 'SMS' || command.type === 'EMAIL') {
      backupCode = Math.floor(100000 + Math.random() * 900000).toString()
      secret = await bcrypt.hash(backupCode, 10)
    } else {
      throw new BadRequestException(`Unsupported MFA type: ${command.type}`)
    }

    const method = MfaMethod.create({
      tenantId: command.tenantId,
      userId: command.userId,
      type: command.type,
      secret,
      isPrimary: existing.length === 0,
    })
    await this.repo.saveMfaMethod(method)
    await this.outbox.publish(new MfaSetupEvent(command.userId, command.type))

    this.logger.log(`MFA ${command.type} set up for user ${command.userId}`)

    return {
      methodId: method.id,
      secret: command.type === 'TOTP' ? secret : undefined,
      qrCode: command.type === 'TOTP' ? authenticator.keyuri(command.userId, 'CRM', secret) : undefined,
      backupCode: command.type === 'SMS' || command.type === 'EMAIL' ? backupCode : undefined,
    }
  }
}

@Injectable()
export class VerifyMfaHandler {
  private readonly logger = new Logger(VerifyMfaHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: VerifyMfaCommand) {
    const method = await this.repo.findMfaMethodById(command.methodId)
    if (!method) throw new NotFoundError('MfaMethod', command.methodId)

    let verified = false

    if (method.type === 'TOTP') {
      try {
        verified = authenticator.verify({ token: command.code, secret: method.secret })
      } catch (error) {
        this.logger.error(`TOTP verify failed: ${error}`)
        verified = false
      }
    } else if (method.type === 'SMS' || method.type === 'EMAIL') {
      verified = await bcrypt.compare(command.code, method.secret)
    }

    if (!verified) {
      return { verified: false }
    }

    await this.outbox.publish(new MfaVerifiedEvent(command.userId, command.methodId))
    return { verified: true }
  }
}

@Injectable()
export class GetRecoveryCodesHandler {
  constructor(private readonly repo: AuthRepository) {}

  async execute(command: GetRecoveryCodesCommand) {
    const codes = await this.repo.findRecoveryCodesByUser(command.userId)
    return codes.map(c => ({
      id: c.id,
      used: c.isUsed,
      usedAt: c.usedAt?.toISOString() ?? null,
    }))
  }
}

@Injectable()
export class RegenerateRecoveryCodesHandler {
  private readonly logger = new Logger(RegenerateRecoveryCodesHandler.name)

  constructor(private readonly repo: AuthRepository) {}

  async execute(command: RegenerateRecoveryCodesCommand) {
    await this.repo.deleteRecoveryCodesByUser(command.userId)

    const codes: string[] = []
    const entities: MfaRecoveryCode[] = []

    for (let i = 0; i < 8; i++) {
      const code = crypto.randomUUID().split('-').join('').substring(0, 16).toUpperCase()
      const hash = await bcrypt.hash(code, 10)
      entities.push(MfaRecoveryCode.create({ userId: command.userId, codeHash: hash }))
      codes.push(code)
    }

    await this.repo.saveRecoveryCodes(entities)
    this.logger.log(`Recovery codes regenerated for user ${command.userId}`)

    return codes
  }
}

@Injectable()
export class UpdatePasswordPolicyHandler {
  private readonly logger = new Logger(UpdatePasswordPolicyHandler.name)

  constructor(private readonly repo: AuthRepository) {}

  async execute(command: UpdatePasswordPolicyCommand): Promise<void> {
    const existing = await this.repo.getPasswordPolicy(command.tenantId)
    const policy = existing
      ? existing.update({
          minLength: command.minLength,
          requireUppercase: command.requireUppercase,
          requireNumbers: command.requireNumbers,
          requireSymbols: command.requireSymbols,
          expireDays: command.expireDays,
          preventReuseLastN: command.preventReuseLastN,
        })
      : PasswordPolicy.default(command.tenantId).update({
          minLength: command.minLength,
          requireUppercase: command.requireUppercase,
          requireNumbers: command.requireNumbers,
          requireSymbols: command.requireSymbols,
          expireDays: command.expireDays,
          preventReuseLastN: command.preventReuseLastN,
        })

    await this.repo.savePasswordPolicy(policy)
    this.logger.log(`Password policy updated for tenant ${command.tenantId}`)
  }
}

@Injectable()
export class CreateIpRestrictionHandler {
  private readonly logger = new Logger(CreateIpRestrictionHandler.name)

  constructor(private readonly repo: AuthRepository) {}

  async execute(command: CreateIpRestrictionCommand) {
    const restriction = IpRestriction.create({
      tenantId: command.tenantId,
      userId: command.userId,
      ipAddress: command.ipAddress,
      type: command.type,
      description: command.description,
    })
    await this.repo.saveIpRestriction(restriction)
    this.logger.log(`IP restriction ${command.type} for ${command.ipAddress} created`)
    return { id: restriction.id }
  }
}

@Injectable()
export class DeleteIpRestrictionHandler {
  constructor(private readonly repo: AuthRepository) {}

  async execute(command: DeleteIpRestrictionCommand): Promise<void> {
    const existing = await this.repo.findIpRestrictionById(command.id)
    if (!existing) throw new NotFoundError('IpRestriction', command.id)

    await this.repo.deleteIpRestriction(command.id)
  }
}

@Injectable()
export class RevokeSessionHandler {
  private readonly logger = new Logger(RevokeSessionHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RevokeSessionCommand): Promise<void> {
    const session = await this.repo.findSessionById(command.sessionId)
    if (!session) throw new NotFoundError('Session', command.sessionId)

    await this.repo.saveSession(session.revoke())
    await this.outbox.publish(new SessionRevokedEvent(session.userId, command.sessionId))
    this.logger.log(`Session ${command.sessionId} revoked`)
  }
}

@Injectable()
export class CreateOAuthProviderHandler {
  private readonly logger = new Logger(CreateOAuthProviderHandler.name)

  constructor(private readonly repo: AuthRepository) {}

  async execute(command: CreateOAuthProviderCommand) {
    const existing = await this.repo.findOAuthProviderByName(command.tenantId, command.providerName)
    if (existing) throw new ConflictError(`OAuth provider ${command.providerName} already exists`)

    const provider = OAuthProvider.create({
      tenantId: command.tenantId,
      providerName: command.providerName,
      clientId: command.clientId,
      clientSecret: command.clientSecret,
    })
    await this.repo.saveOAuthProvider(provider)
    this.logger.log(`OAuth provider ${command.providerName} created for tenant ${command.tenantId}`)
    return { id: provider.id }
  }
}

@Injectable()
export class DeleteOAuthProviderHandler {
  constructor(private readonly repo: AuthRepository) {}

  async execute(command: DeleteOAuthProviderCommand): Promise<void> {
    const existing = await this.repo.findOAuthProviderById(command.id)
    if (!existing) throw new NotFoundError('OAuthProvider', command.id)

    await this.repo.deleteOAuthProvider(command.id)
  }
}
