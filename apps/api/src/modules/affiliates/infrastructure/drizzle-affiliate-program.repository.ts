import { Injectable } from '@nestjs/common'
import { eq, ilike, and, asc, or, gt } from 'drizzle-orm'
import { getDb, affiliatePrograms as affiliateProgramsTable } from '@crm/database'
import { AffiliateProgramRepository, ProgramFilter, PaginatedPrograms } from '../domain/repositories/affiliate-program.repository'
import { AffiliateProgram } from '../domain/entities/affiliate-program.entity'
import { AffiliateMapper } from './affiliate.mapper'

@Injectable()
export class DrizzleAffiliateProgramRepository extends AffiliateProgramRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<AffiliateProgram | null> {
    const row = await this.db.query.affiliatePrograms.findFirst({
      where: and(eq(affiliateProgramsTable.tenantId, tenantId)!, eq(affiliateProgramsTable.id, id)) as any,
    })
    return row ? AffiliateMapper.programToDomain(row) : null
  }

  async findByName(tenantId: string, name: string): Promise<AffiliateProgram | null> {
    const row = await this.db.query.affiliatePrograms.findFirst({
      where: and(eq(affiliateProgramsTable.tenantId, tenantId)!, eq(affiliateProgramsTable.name, name)) as any,
    })
    return row ? AffiliateMapper.programToDomain(row) : null
  }

  async list(tenantId: string, filter: ProgramFilter): Promise<PaginatedPrograms> {
    const conditions = [eq(affiliateProgramsTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(affiliateProgramsTable.createdAt, new Date(filter.cursor)))
    if (filter.search) {
      conditions.push(ilike(affiliateProgramsTable.name, `%${filter.search}%`))
    }
    if (filter.isActive !== undefined) conditions.push(eq(affiliateProgramsTable.isActive, filter.isActive))

    const rows = await this.db.query.affiliatePrograms.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(affiliateProgramsTable.createdAt), asc(affiliateProgramsTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(AffiliateMapper.programToDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(program: AffiliateProgram): Promise<void> {
    const row = AffiliateMapper.programToPersistence(program)
    await this.db.insert(affiliateProgramsTable).values(row).onConflictDoUpdate({
      target: affiliateProgramsTable.id,
      set: row,
    })
  }
}
