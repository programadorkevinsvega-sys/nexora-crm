import { Injectable } from '@nestjs/common'
import { UserInvitationRepository } from '../../domain/repositories/user-invitation.repository'

export class ListInvitationsCommand {
  constructor(readonly tenantId: string) {}
}

@Injectable()
export class ListInvitationsHandler {
  constructor(private readonly invitations: UserInvitationRepository) {}

  async execute(command: ListInvitationsCommand) {
    const rows = await this.invitations.listByTenant(command.tenantId)
    return rows.map((invitation) => invitation.toPublicResponse())
  }
}
