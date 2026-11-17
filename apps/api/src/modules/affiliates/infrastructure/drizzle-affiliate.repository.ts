import { Injectable } from '@nestjs/common'
import { eq, and, asc, gt } from 'drizzle-orm'
import { getDb, affiliates as affiliatesTable } from '@crm/database'
import { AffiliateRepository, AffiliateFilter, PaginatedAffiliates } from '../domain/repositories/affiliate.repository'
import { Affiliate } from '../domain/entities/affiliate.entity'
import { AffiliateMapper } from './affiliate.mapper'

@Injectable()
export class DrizzleAffiliateRepository extends AffiliateRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<Affiliate | null> {
    const row = await this.db.query.affiliates.findFirst({
      where: and(eq(affiliatesTable.tenantId, tenantId)!, eq(affiliatesTable.id, id)) as any,
    })
    return row ? AffiliateMapper.affiliateToDomain(row) : null
  }

  async findByReferralCode(tenantId: string, referralCode: string): Promise<Affiliate | null> {
    const row = await this.db.query.affiliates.findFirst({
      where: and(eq(affiliatesTable.tenantId, tenantId)!, eq(affiliatesTable.referralCode, referralCode)) as any,
    })
    return row ? AffiliateMapper.affiliateToDomain(row) : null
  }

  async list(tenantId: string, filter: AffiliateFilter): Promise<PaginatedAffiliates> {
    const conditions = [eq(affiliatesTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(affiliatesTable.createdAt, new Date(filter.cursor)))
    if (filter.programId) conditions.push(eq(affiliatesTable.programId, filter.programId))
    if (filter.status) conditions.push(eq(affiliatesTable.status, filter.status))

    const rows = await this.db.query.affiliates.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(affiliatesTable.createdAt), asc(affiliatesTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(AffiliateMapper.affiliateToDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(affiliate: Affiliate): Promise<void> {
    const row = AffiliateMapper.affiliateToPersistence(affiliate)
    await this.db.insert(affiliatesTable).values(row).onConflictDoUpdate({
      target: affiliatesTable.id,
      set: row,
    })
  }
}
