import { ConflictException, Injectable } from '@nestjs/common'
import { createHash } from 'crypto'
import { CustomerPortalAccessRepository } from '../../domain/repositories/customer-portal-access.repository'

@Injectable()
export class PreviewPortalInvitationHandler {
  constructor(private readonly repository: CustomerPortalAccessRepository) {}

  async execute(token: string) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new ConflictException('Portal invitation is invalid')
    const hash = createHash('sha256').update(token).digest('hex')
    const invitation = await this.repository.findInvitationByTokenHash(hash)
    if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt.getTime() <= Date.now()) {
      throw new ConflictException('Portal invitation is invalid, expired or already used')
    }
    return {
      id: invitation.id, tenantId: invitation.tenantId, contactId: invitation.contactId,
      email: invitation.email, expiresAt: invitation.expiresAt, status: invitation.status,
    }
  }
}
