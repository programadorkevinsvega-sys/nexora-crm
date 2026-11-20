import { ConflictException, Injectable } from '@nestjs/common'
import { createHash, randomBytes, randomUUID } from 'crypto'
import { CustomerPortalAccessRepository } from '../../domain/repositories/customer-portal-access.repository'

@Injectable()
export class CreatePortalInvitationHandler {
  constructor(private readonly repository: CustomerPortalAccessRepository) {}

  async execute(input: { tenantId: string; contactId: string; email: string; invitedBy: string }) {
    const email = input.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ConflictException('The contact must have a valid email address')
    }
    if (await this.repository.findAccountByContact(input.tenantId, input.contactId)) {
      throw new ConflictException('This contact already has an active portal account')
    }
    if (await this.repository.findAccountByContact(input.tenantId, input.contactId)) {
      throw new ConflictException('This contact already has an active portal account')
    }
    const existing = (await this.repository.listInvitations(input.tenantId, input.contactId))
      .find((item) => item.status === 'PENDING')
    if (existing) throw new ConflictException('A pending portal invitation already exists for this contact')
    const token = randomBytes(32).toString('base64url')
    const now = new Date()
    const invitation = await this.repository.createInvitation({
      id: randomUUID(), tenantId: input.tenantId, contactId: input.contactId,
      email, invitedBy: input.invitedBy, tokenHash: createHash('sha256').update(token).digest('hex'),
      status: 'PENDING', expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      revokedAt: null,
    })
    return { invitation, token }
  }
}
