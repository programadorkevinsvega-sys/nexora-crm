import { Injectable } from '@nestjs/common'
import { createHash, randomBytes } from 'crypto'
import { CustomerPortalAccessRepository } from '../../domain/repositories/customer-portal-access.repository'

@Injectable()
export class ResendPortalInvitationHandler {
  constructor(private readonly repository: CustomerPortalAccessRepository) {}

  async execute(tenantId: string, invitationId: string) {
    const token = randomBytes(32).toString('base64url')
    const invitation = await this.repository.rotateInvitation(
      tenantId, invitationId,
      createHash('sha256').update(token).digest('hex'),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    )
    return { invitation, token }
  }
}
