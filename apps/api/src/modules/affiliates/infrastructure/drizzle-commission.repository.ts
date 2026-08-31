import { Injectable } from '@nestjs/common'
import { eq, and, asc, gt } from 'drizzle-orm'
import { getDb, affiliateCommissions as commissionsTable, affiliatePayouts as payoutsTable } from '@crm/database'
import { CommissionRepository, CommissionFilter, PayoutFilter, PaginatedCommissions, PaginatedPayouts } from '../domain/repositories/commission.repository'
import { AffiliateCommission } from '../domain/entities/affiliate-commission.entity'
import { AffiliatePayout } from '../domain/entities/affiliate-payout.entity'
import { AffiliateMapper } from './affiliate.mapper'

@Injectable()
export class DrizzleCommissionRepository extends CommissionRepository {
  private get db() {
    return getDb()
  }

  async findCommissionById(tenantId: string, id: string): Promise<AffiliateCommission | null> {
    const row = await this.db.query.affiliateCommissions.findFirst({
      where: and(eq(commissionsTable.tenantId, tenantId)!, eq(commissionsTable.id, id)) as any,
    })
    return row ? AffiliateMapper.commissionToDomain(row) : null
  }

  async listCommissions(tenantId: string, filter: CommissionFilter): Promise<PaginatedCommissions> {
    const conditions = [eq(commissionsTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(commissionsTable.createdAt, new Date(filter.cursor)))
    if (filter.affiliateId) conditions.push(eq(commissionsTable.affiliateId, filter.affiliateId))
    if (filter.status) conditions.push(eq(commissionsTable.status, filter.status))

    const rows = await this.db.query.affiliateCommissions.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(commissionsTable.createdAt), asc(commissionsTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(AffiliateMapper.commissionToDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async saveCommission(commission: AffiliateCommission): Promise<void> {
    const row = AffiliateMapper.commissionToPersistence(commission)
    await this.db.insert(commissionsTable).values(row).onConflictDoUpdate({
      target: commissionsTable.id,
      set: row,
    })
  }

  async findPayoutById(tenantId: string, id: string): Promise<AffiliatePayout | null> {
    const row = await this.db.query.affiliatePayouts.findFirst({
      where: and(eq(payoutsTable.tenantId, tenantId)!, eq(payoutsTable.id, id)) as any,
    })
    return row ? AffiliateMapper.payoutToDomain(row) : null
  }

  async listPayouts(tenantId: string, filter: PayoutFilter): Promise<PaginatedPayouts> {
    const conditions = [eq(payoutsTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(payoutsTable.createdAt, new Date(filter.cursor)))
    if (filter.affiliateId) conditions.push(eq(payoutsTable.affiliateId, filter.affiliateId))
    if (filter.status) conditions.push(eq(payoutsTable.status, filter.status))

    const rows = await this.db.query.affiliatePayouts.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(payoutsTable.createdAt), asc(payoutsTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(AffiliateMapper.payoutToDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async savePayout(payout: AffiliatePayout): Promise<void> {
    const row = AffiliateMapper.payoutToPersistence(payout)
    await this.db.insert(payoutsTable).values(row).onConflictDoUpdate({
      target: payoutsTable.id,
      set: row,
    })
  }
}
