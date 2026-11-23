import { Injectable } from '@nestjs/common'
import { TicketRepository } from '../../domain/repositories/ticket.repository'
import { ReplyRepository } from '../../domain/repositories/reply.repository'
import { GetTicketQuery, ListTicketsQuery, GetTicketRepliesQuery } from './support-ticket.queries'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class GetTicketHandler {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly replyRepo: ReplyRepository,
  ) {}

  async execute(query: GetTicketQuery) {
    const ticket = await this.ticketRepo.findById(query.tenantId, query.id)
    if (!ticket) throw new NotFoundError('Ticket', query.id)

    const replies = await this.replyRepo.findByTicketId(query.tenantId, query.id)

    return { ticket, replies }
  }
}

@Injectable()
export class ListTicketsHandler {
  constructor(private readonly ticketRepo: TicketRepository) {}

  async execute(query: ListTicketsQuery) {
    return this.ticketRepo.list(query.tenantId, query.filter)
  }
}

@Injectable()
export class GetTicketRepliesHandler {
  constructor(private readonly replyRepo: ReplyRepository) {}

  async execute(query: GetTicketRepliesQuery) {
    return this.replyRepo.findByTicketId(query.tenantId, query.ticketId)
  }
}
