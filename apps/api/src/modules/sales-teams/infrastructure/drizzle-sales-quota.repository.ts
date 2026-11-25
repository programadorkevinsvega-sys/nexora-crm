import { Injectable } from '@nestjs/common'
import { eq, and, asc, gt } from 'drizzle-orm'
import { getDb, salesQuotas } from '@crm/database'
import { SalesQuotaRepository, SalesQuotaFilter, PaginatedSalesQuotas } from '../domain/repositories/sales-quota.repository'
import { SalesQuota } from '../domain/entities/sales-quota.entity'
import { SalesQuotaMapper } from './sales-quota.mapper'

@Injectable()
export class DrizzleSalesQuotaRepository extends SalesQuotaRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<SalesQuota | null> {
    const row = await this.db.query.salesQuotas.findFirst({
      where: and(eq(salesQuotas.tenantId, tenantId), eq(salesQuotas.id, id)),
    })
    return row ? SalesQuotaMapper.toDomain(row) : null
  }

  async listByTeam(tenantId: string, teamId: string, filter: SalesQuotaFilter): Promise<PaginatedSalesQuotas> {
    const conditions = [
      eq(salesQuotas.tenantId, tenantId),
      eq(salesQuotas.teamId, teamId),
    ]

    if (filter.userId) conditions.push(eq(salesQuotas.userId, filter.userId))
    if (filter.periodMonth) conditions.push(eq(salesQuotas.periodMonth, filter.periodMonth))
    if (filter.periodYear) conditions.push(eq(salesQuotas.periodYear, filter.periodYear))
    if (filter.cursor) conditions.push(gt(salesQuotas.createdAt, new Date(filter.cursor)))

    const rows = await this.db.query.salesQuotas.findMany({
      where: and(...conditions),
      limit: filter.limit + 1,
      orderBy: [asc(salesQuotas.createdAt), asc(salesQuotas.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(SalesQuotaMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async listByUser(tenantId: string, userId: string, filter: SalesQuotaFilter): Promise<PaginatedSalesQuotas> {
    const conditions = [
      eq(salesQuotas.tenantId, tenantId),
      eq(salesQuotas.userId, userId),
    ]

    if (filter.periodMonth) conditions.push(eq(salesQuotas.periodMonth, filter.periodMonth))
    if (filter.periodYear) conditions.push(eq(salesQuotas.periodYear, filter.periodYear))
    if (filter.cursor) conditions.push(gt(salesQuotas.createdAt, new Date(filter.cursor)))

    const rows = await this.db.query.salesQuotas.findMany({
      where: and(...conditions),
      limit: filter.limit + 1,
      orderBy: [asc(salesQuotas.createdAt), asc(salesQuotas.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(SalesQuotaMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(quota: SalesQuota): Promise<void> {
    const row = SalesQuotaMapper.toPersistence(quota)
    await this.db.insert(salesQuotas).values(row).onConflictDoUpdate({
      target: salesQuotas.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(salesQuotas).where(
      and(eq(salesQuotas.tenantId, tenantId), eq(salesQuotas.id, id)),
    )
  }
}
