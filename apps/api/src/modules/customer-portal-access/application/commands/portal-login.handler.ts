import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CustomerPortalAccessRepository } from '../../domain/repositories/customer-portal-access.repository'
import { CustomerPortalTokenService } from '../services/customer-portal-token.service'

@Injectable()
export class PortalLoginHandler {
  constructor(
    private readonly repository: CustomerPortalAccessRepository,
    private readonly tokens: CustomerPortalTokenService,
  ) {}

  async execute(tenantId: string, email: string, password: string) {
    const account = await this.repository.findAccountByEmail(tenantId, email.trim().toLowerCase())
    if (!account || account.status !== 'ACTIVE' || !(await bcrypt.compare(password, account.passwordHash))) {
      throw new UnauthorizedException('Invalid portal credentials')
    }
    const pair = await this.tokens.issue({
      accountId: account.id, tenantId: account.tenantId, contactId: account.contactId, email: account.email,
    })
    await this.repository.recordLogin(
      tenantId, account.id, await bcrypt.hash(pair.refreshToken, 12),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    )
    return {
      ...pair, accountId: account.id, tenantId: account.tenantId,
      contactId: account.contactId, email: account.email,
    }
  }
}
