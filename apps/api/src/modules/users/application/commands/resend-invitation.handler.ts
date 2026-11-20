import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { createHash, randomBytes } from 'crypto'
import { UserInvitationRepository } from '../../domain/repositories/user-invitation.repository'

export class ResendInvitationCommand {
  constructor(
    readonly tenantId: string,
    readonly invitationId: string,
  ) {}
}

@Injectable()
export class ResendInvitationHandler {
  constructor(private readonly invitations: UserInvitationRepository) {}

  async execute(command: ResendInvitationCommand) {
    const existing = await this.invitations.findById(command.tenantId, command.invitationId)
    if (!existing) throw new NotFoundException('Invitation not found')
    if (!existing.canBeResent()) {
      throw new ConflictException('Only pending or expired invitations can be resent')
    }

    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const invitation = await this.invitations.rotate(
      command.tenantId,
      command.invitationId,
      createHash('sha256').update(token).digest('hex'),
      expiresAt,
    )
    return { invitation: invitation.toPublicResponse(), token }
  }
}
