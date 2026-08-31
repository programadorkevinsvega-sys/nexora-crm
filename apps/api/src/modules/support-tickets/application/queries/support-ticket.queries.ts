import { TicketFilter } from '../../domain/repositories/ticket.repository'

export class GetTicketQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListTicketsQuery {
  constructor(readonly tenantId: string, readonly filter: TicketFilter) {}
}

export class GetTicketRepliesQuery {
  constructor(readonly tenantId: string, readonly ticketId: string) {}
}
