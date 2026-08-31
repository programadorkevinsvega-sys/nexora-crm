import { TicketReply } from '../entities/ticket-reply.entity'

export abstract class ReplyRepository {
  abstract findByTicketId(tenantId: string, ticketId: string): Promise<TicketReply[]>
  abstract save(reply: TicketReply): Promise<void>
}
