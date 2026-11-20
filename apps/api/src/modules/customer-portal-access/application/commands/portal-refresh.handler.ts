import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CustomerPortalAccessRepository } from '../../domain/repositories/customer-portal-access.repository'
import { CustomerPortalTokenService } from '../services/customer-portal-token.service'

@Injectable()
export class PortalRefreshHandler {
  constructor(
    private readonly repository: CustomerPortalAccessRepository,
    private readonly tokens: CustomerPortalTokenService,
  ) {}

  async execute(tenantId: string, refreshToken: string) {
    let payload: Awaited<ReturnType<CustomerPortalTokenService['verifyRefreshToken']>>
    try { payload = await this.tokens.verifyRefreshToken(refreshToken) }
    catch { throw new UnauthorizedException('Invalid portal refresh token') }
    if (
      payload.customerPortal !== true || payload.tokenType !== 'refresh' ||
      payload.tenantId !== tenantId || !payload.sub || !payload.contactId
    ) throw new UnauthorizedException('Invalid portal refresh token')

    const account = await this.repository.findAccountById(tenantId, payload.sub)
    if (!account || account.status !== 'ACTIVE' || !account.refreshTokenHash ||
        !account.refreshTokenExpiresAt || account.refreshTokenExpiresAt.getTime() <= Date.now() ||
        !(await bcrypt.compare(refreshToken, account.refreshTokenHash))) {
      throw new UnauthorizedException('Portal session is invalid or expired')
    }

    const pair = await this.tokens.issue({
      accountId: account.id, tenantId, contactId: account.contactId, email: account.email,
    })
    const nextHash = await bcrypt.hash(pair.refreshToken, 12)
    const rotated = await this.repository.rotateRefreshToken(
      tenantId, account.id, account.refreshTokenHash, nextHash,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    )
    if (!rotated) throw new UnauthorizedException('Portal refresh token was already rotated')
    return {
      ...pair, accountId: account.id, tenantId,
      contactId: account.contactId, email: account.email,
    }
  }
}
