import { Injectable } from '@nestjs/common'
import { CustomerPortalAccessRepository } from '../../domain/repositories/customer-portal-access.repository'

@Injectable()
export class RevokePortalInvitationHandler {
  constructor(private readonly repository: CustomerPortalAccessRepository) {}
  async execute(tenantId: string, invitationId: string) {
    await this.repository.revokeInvitation(tenantId, invitationId)
    return { revoked: true }
  }
}
