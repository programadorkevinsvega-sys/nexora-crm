import { Injectable } from '@nestjs/common'
import { UserInvitationRepository } from '../../domain/repositories/user-invitation.repository'

export class RevokeInvitationCommand {
  constructor(
    readonly tenantId: string,
    readonly invitationId: string,
  ) {}
}

@Injectable()
export class RevokeInvitationHandler {
  constructor(private readonly invitations: UserInvitationRepository) {}

  async execute(command: RevokeInvitationCommand) {
    await this.invitations.revoke(command.tenantId, command.invitationId)
    return { revoked: true }
  }
}
