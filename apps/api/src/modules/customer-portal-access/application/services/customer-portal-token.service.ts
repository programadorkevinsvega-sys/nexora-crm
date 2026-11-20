import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

export const PORTAL_ACCESS_AUDIENCE = 'nexora-customer-portal'
export const PORTAL_REFRESH_AUDIENCE = 'nexora-customer-portal:refresh'
export const PORTAL_TOKEN_ISSUER = 'nexora-crm'

@Injectable()
export class CustomerPortalTokenService {
  constructor(private readonly jwt: JwtService) {}

  async issue(input: { accountId: string; tenantId: string; contactId: string; email: string }) {
    const base = {
      sub: input.accountId, tenantId: input.tenantId, contactId: input.contactId,
      email: input.email, customerPortal: true,
    }
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync({ ...base, tokenType: 'access' }, {
        audience: PORTAL_ACCESS_AUDIENCE, issuer: PORTAL_TOKEN_ISSUER, expiresIn: '15m',
      }),
      this.jwt.signAsync({ ...base, tokenType: 'refresh' }, {
        audience: PORTAL_REFRESH_AUDIENCE, issuer: PORTAL_TOKEN_ISSUER, expiresIn: '30d',
      }),
    ])
    return { accessToken, refreshToken }
  }

  verifyRefreshToken(token: string) {
    return this.jwt.verifyAsync<{
      sub: string; tenantId: string; contactId: string; email: string
      customerPortal: boolean; tokenType: string
    }>(token, { audience: PORTAL_REFRESH_AUDIENCE, issuer: PORTAL_TOKEN_ISSUER })
  }
}
