import { Injectable } from '@nestjs/common'
import { UserInvitationRepository } from '../../domain/repositories/user-invitation.repository'

export class CompleteInvitationAcceptanceCommand {
  constructor(
    readonly tenantId: string,
    readonly invitationId: string,
    readonly userId: string,
  ) {}
}

@Injectable()
export class CompleteInvitationAcceptanceHandler {
  constructor(private readonly invitations: UserInvitationRepository) {}

  async execute(command: CompleteInvitationAcceptanceCommand) {
    await this.invitations.completeAcceptance(
      command.tenantId,
      command.invitationId,
      command.userId,
    )
    return { accepted: true }
  }
}
