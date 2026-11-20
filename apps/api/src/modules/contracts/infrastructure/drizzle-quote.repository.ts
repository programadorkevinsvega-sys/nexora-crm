import { Injectable } from '@nestjs/common'
import { eq, and, asc, or, gt, ilike } from 'drizzle-orm'
import { getDb, quotes as quotesTable } from '@crm/database'
import { QuoteRepository, QuoteFilter, PaginatedQuotes } from '../domain/repositories/quote.repository'
import { Quote, QuoteStatus } from '../domain/entities/quote.entity'
import { QuoteMapper } from './quote.mapper'

@Injectable()
export class DrizzleQuoteRepository extends QuoteRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<Quote | null> {
    const row = await this.db.query.quotes.findFirst({
      where: and(eq(quotesTable.tenantId, tenantId)!, eq(quotesTable.id, id)) as any,
    })
    return row ? QuoteMapper.toDomain(row) : null
  }

  async list(tenantId: string, filter: QuoteFilter): Promise<PaginatedQuotes> {
    const conditions = [eq(quotesTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(quotesTable.createdAt, new Date(filter.cursor)))
    if (filter.status) conditions.push(eq(quotesTable.status, filter.status))
    if (filter.dealId) conditions.push(eq(quotesTable.dealId, filter.dealId))

    const rows = await this.db.query.quotes.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(quotesTable.createdAt), asc(quotesTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(QuoteMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(quote: Quote): Promise<void> {
    const row = QuoteMapper.toPersistence(quote)
    await this.db.insert(quotesTable).values(row).onConflictDoUpdate({
      target: quotesTable.id,
      set: row,
    })
  }

  async transitionStatus(
    tenantId: string,
    id: string,
    expectedStatus: QuoteStatus,
    nextStatus: QuoteStatus,
  ): Promise<boolean> {
    const updated = await this.db.update(quotesTable)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(and(
        eq(quotesTable.tenantId, tenantId),
        eq(quotesTable.id, id),
        eq(quotesTable.status, expectedStatus),
      ))
      .returning({ id: quotesTable.id })

    return updated.length === 1
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(quotesTable).where(
      and(eq(quotesTable.tenantId, tenantId), eq(quotesTable.id, id)),
    )
  }
}
