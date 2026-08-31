import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { Session } from '../../domain/entities/session.entity'
import { RefreshTokenCommand } from './auth.commands'

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
