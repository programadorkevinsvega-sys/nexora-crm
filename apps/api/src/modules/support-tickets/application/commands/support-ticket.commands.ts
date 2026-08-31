import { TicketStatus, TicketPriority } from '../../domain/entities/support-ticket.entity'
import { AuthorType } from '../../domain/entities/ticket-reply.entity'

export class CreateTicketCommand {
  constructor(
    readonly tenantId: string,
    readonly subject: string,
    readonly description: string,
    readonly contactId?: string,
    readonly priority?: TicketPriority,
    readonly assignedUserId?: string,
    readonly slaId?: string,
  ) {}
}

export class UpdateTicketStatusCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly status: TicketStatus,
  ) {}
}

export class AssignTicketCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly assignedUserId: string,
  ) {}
}

export class AddReplyCommand {
  constructor(
    readonly tenantId: string,
    readonly ticketId: string,
    readonly authorType: AuthorType,
    readonly authorId: string,
    readonly message: string,
    readonly isInternalNote?: boolean,
  ) {}
}
