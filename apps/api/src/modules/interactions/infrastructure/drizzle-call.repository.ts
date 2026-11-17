import { Injectable } from '@nestjs/common'
import { eq, and, asc, gt } from 'drizzle-orm'
import { getDb, calls as callsTable } from '@crm/database'
import { CallRepository, CallFilter, PaginatedCalls } from '../domain/repositories/call.repository'
import { Call } from '../domain/entities/call.entity'
import { CallMapper } from './interactions.mapper'

@Injectable()
export class DrizzleCallRepository extends CallRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<Call | null> {
    const row = await this.db.query.calls.findFirst({
      where: and(eq(callsTable.tenantId, tenantId)!, eq(callsTable.id, id)) as any,
    })
    return row ? CallMapper.toDomain(row) : null
  }

  async list(tenantId: string, filter: CallFilter): Promise<PaginatedCalls> {
    const conditions = [eq(callsTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(callsTable.createdAt, new Date(filter.cursor)))
    if (filter.contactId) conditions.push(eq(callsTable.contactId, filter.contactId))

    const rows = await this.db.query.calls.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(callsTable.createdAt), asc(callsTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(CallMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(call: Call): Promise<void> {
    const row = CallMapper.toPersistence(call)
    await this.db.insert(callsTable).values(row)
  }
}
