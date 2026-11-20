import { createHash } from 'crypto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { UserInvitationRepository } from '../../domain/repositories/user-invitation.repository'

export class GetInvitationByTokenQuery {
  constructor(readonly token: string) {}
}

@Injectable()
export class GetInvitationByTokenHandler {
  constructor(private readonly invitations: UserInvitationRepository) {}

  async execute(query: GetInvitationByTokenQuery) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(query.token)) {
      throw new NotFoundException('Invitation token is invalid')
    }
    const tokenHash = createHash('sha256').update(query.token).digest('hex')
    const invitation = await this.invitations.findByTokenHash(tokenHash)
    if (!invitation) throw new NotFoundException('Invitation token is invalid or has already been used')
    return invitation.toPublicResponse()
  }
}
