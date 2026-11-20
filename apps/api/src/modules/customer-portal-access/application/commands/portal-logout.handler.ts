import { Injectable } from '@nestjs/common'
import { CustomerPortalAccessRepository } from '../../domain/repositories/customer-portal-access.repository'

@Injectable()
export class PortalLogoutHandler {
  constructor(private readonly repository: CustomerPortalAccessRepository) {}
  async execute(tenantId: string, accountId: string) {
    await this.repository.revokeRefreshToken(tenantId, accountId)
    return { loggedOut: true }
  }
}
