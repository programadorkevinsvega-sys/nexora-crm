import { Injectable } from '@nestjs/common'
import { eq, and, asc } from 'drizzle-orm'
import { getDb, ticketReplies as ticketRepliesTable } from '@crm/database'
import { ReplyRepository } from '../domain/repositories/reply.repository'
import { TicketReply } from '../domain/entities/ticket-reply.entity'
import { SupportTicketMapper } from './support-ticket.mapper'

@Injectable()
export class DrizzleReplyRepository extends ReplyRepository {
  private get db() {
    return getDb()
  }

  async findByTicketId(tenantId: string, ticketId: string): Promise<TicketReply[]> {
    const rows = await this.db.query.ticketReplies.findMany({
      where: and(eq(ticketRepliesTable.tenantId, tenantId)!, eq(ticketRepliesTable.ticketId, ticketId)) as any,
      orderBy: [asc(ticketRepliesTable.createdAt)],
    })
    return rows.map(SupportTicketMapper.replyToDomain)
  }

  async save(reply: TicketReply): Promise<void> {
    const row = SupportTicketMapper.replyToPersistence(reply)
    await this.db.insert(ticketRepliesTable).values(row).onConflictDoUpdate({
      target: ticketRepliesTable.id,
      set: row,
    })
  }
}
