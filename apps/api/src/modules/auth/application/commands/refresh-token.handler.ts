import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { and, eq } from 'drizzle-orm'
import { getDb, roles, userRoles } from '@crm/database'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { Session } from '../../domain/entities/session.entity'
import { RefreshTokenCommand } from './auth.commands'

type RefreshPayload = {
  sub: string
  tenantId: string
  email: string
  roles?: string[]
  role?: string
}

@Injectable()
export class RefreshTokenHandler {
  private readonly logger = new Logger(RefreshTokenHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RefreshTokenCommand) {
    let payload: RefreshPayload
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

    const roleNames = await this.findRoleNames(
      command.tenantId,
      payload.sub,
      payload.roles ?? (payload.role ? [payload.role] : undefined),
    )
    const tokens = await this.generateTokens(command.tenantId, payload.sub, payload.email, roleNames)

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

  private async findRoleNames(tenantId: string, userId: string, fallback?: string[]): Promise<string[]> {
    if (!process.env.DATABASE_URL) return fallback ?? []

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
      return fallback ?? []
    }
  }

  private async generateTokens(tenantId: string, userId: string, email: string, roleNames: string[]) {
    const payload = {
      sub: userId,
      tenantId,
      email,
      roles: roleNames,
      ...(roleNames.length === 1 ? { role: roleNames[0] } : {}),
    }
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' })
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' })
    return { accessToken, refreshToken }
  }
}
