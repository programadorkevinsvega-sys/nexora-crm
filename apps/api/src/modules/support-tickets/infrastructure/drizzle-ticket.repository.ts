import { Injectable } from '@nestjs/common'
import { eq, ilike, and, asc, or, gt } from 'drizzle-orm'
import { getDb, supportTickets as supportTicketsTable } from '@crm/database'
import { TicketRepository, TicketFilter, PaginatedTickets } from '../domain/repositories/ticket.repository'
import { SupportTicket } from '../domain/entities/support-ticket.entity'
import { SupportTicketMapper } from './support-ticket.mapper'

@Injectable()
export class DrizzleTicketRepository extends TicketRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<SupportTicket | null> {
    const row = await this.db.query.supportTickets.findFirst({
      where: and(eq(supportTicketsTable.tenantId, tenantId)!, eq(supportTicketsTable.id, id)) as any,
    })
    return row ? SupportTicketMapper.toDomain(row) : null
  }

  async findByTenantId(tenantId: string): Promise<SupportTicket[]> {
    const rows = await this.db.query.supportTickets.findMany({
      where: eq(supportTicketsTable.tenantId, tenantId),
      orderBy: [asc(supportTicketsTable.createdAt)],
    })
    return rows.map(SupportTicketMapper.toDomain)
  }

  async list(tenantId: string, filter: TicketFilter): Promise<PaginatedTickets> {
    const conditions = [eq(supportTicketsTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(supportTicketsTable.createdAt, new Date(filter.cursor)))
    if (filter.status) conditions.push(eq(supportTicketsTable.status, filter.status))
    if (filter.priority) conditions.push(eq(supportTicketsTable.priority, filter.priority))
    if (filter.assignedUserId) conditions.push(eq(supportTicketsTable.assignedUserId, filter.assignedUserId))
    if (filter.contactId) conditions.push(eq(supportTicketsTable.contactId, filter.contactId))
    if (filter.search) {
      conditions.push(or(
          ilike(supportTicketsTable.subject, `%${filter.search}%`),
          ilike(supportTicketsTable.description, `%${filter.search}%`),
        )!,
      )
    }

    const rows = await this.db.query.supportTickets.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(supportTicketsTable.createdAt), asc(supportTicketsTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(SupportTicketMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(ticket: SupportTicket): Promise<void> {
    const row = SupportTicketMapper.toPersistence(ticket)
    await this.db.insert(supportTicketsTable).values(row).onConflictDoUpdate({
      target: supportTicketsTable.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(supportTicketsTable).where(
      and(eq(supportTicketsTable.tenantId, tenantId), eq(supportTicketsTable.id, id)),
    )
  }
}
