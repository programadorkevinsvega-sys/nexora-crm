import { Injectable } from '@nestjs/common'
import { eq, ilike, and, asc, or, gt } from 'drizzle-orm'
import { getDb, helpdeskConversations as conversationsTable } from '@crm/database'
import { ConversationRepository, ConversationFilter, PaginatedConversations } from '../domain/repositories/conversation.repository'
import { HelpdeskConversation } from '../domain/entities/conversation.entity'
import { ConversationMapper } from './mappers/conversation.mapper'

@Injectable()
export class DrizzleConversationRepository extends ConversationRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<HelpdeskConversation | null> {
    const row = await this.db.query.helpdeskConversations.findFirst({
      where: and(eq(conversationsTable.tenantId, tenantId)!, eq(conversationsTable.id, id)) as any,
    })
    return row ? ConversationMapper.toDomain(row) : null
  }

  async list(tenantId: string, filter: ConversationFilter): Promise<PaginatedConversations> {
    const conditions = [eq(conversationsTable.tenantId, tenantId)]

    if (filter.mailboxId) conditions.push(eq(conversationsTable.mailboxId, filter.mailboxId))
    if (filter.status) conditions.push(eq(conversationsTable.status, filter.status))
    if (filter.assigneeUserId) conditions.push(eq(conversationsTable.assigneeUserId, filter.assigneeUserId))
    if (filter.priority) conditions.push(eq(conversationsTable.priority, filter.priority))
    if (filter.cursor) conditions.push(gt(conversationsTable.createdAt, new Date(filter.cursor)))
    if (filter.search) {
      conditions.push(or(
          ilike(conversationsTable.subject, `%${filter.search}%`),
          ilike(conversationsTable.customerEmail, `%${filter.search}%`),
          ilike(conversationsTable.previewText, `%${filter.search}%`),
        )!,
      )
    }

    const rows = await this.db.query.helpdeskConversations.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(conversationsTable.createdAt), asc(conversationsTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(ConversationMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(conversation: HelpdeskConversation): Promise<void> {
    const row = ConversationMapper.toPersistence(conversation)
    await this.db.insert(conversationsTable).values(row as any).onConflictDoUpdate({
      target: conversationsTable.id,
      set: row as any,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(conversationsTable).where(
      and(eq(conversationsTable.tenantId, tenantId), eq(conversationsTable.id, id)),
    )
  }
}
