import { Injectable } from '@nestjs/common'
import { CustomerPortalAccessRepository } from '../../domain/repositories/customer-portal-access.repository'

@Injectable()
export class ListPortalInvitationsHandler {
  constructor(private readonly repository: CustomerPortalAccessRepository) {}
  execute(tenantId: string, contactId?: string) {
    return this.repository.listInvitations(tenantId, contactId)
  }
}
