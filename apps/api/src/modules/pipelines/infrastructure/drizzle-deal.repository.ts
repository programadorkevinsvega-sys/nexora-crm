import { Injectable } from '@nestjs/common'
import { eq, and, or, ilike } from 'drizzle-orm'
import { getDb, deals as dealsTable } from '@crm/database'
import { DealRepository, DealFilter } from '../domain/repositories/deal.repository'
import { Deal } from '../domain/entities/deal.entity'
import { PipelineMapper } from './pipeline.mapper'

@Injectable()
export class DrizzleDealRepository extends DealRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<Deal | null> {
    const row = await this.db.query.deals.findFirst({
      where: and(eq(dealsTable.tenantId, tenantId)!, eq(dealsTable.id, id)) as any,
    })
    return row ? PipelineMapper.dealToDomain(row) : null
  }

  async list(tenantId: string, filter: DealFilter): Promise<Deal[]> {
    const conditions = [eq(dealsTable.tenantId, tenantId)]

    if (filter.pipelineId) conditions.push(eq(dealsTable.pipelineId, filter.pipelineId))
    if (filter.stageId) conditions.push(eq(dealsTable.stageId, filter.stageId))
    if (filter.status) conditions.push(eq(dealsTable.status, filter.status))
    if (filter.contactId) conditions.push(eq(dealsTable.contactId, filter.contactId))
    if (filter.companyId) conditions.push(eq(dealsTable.companyId, filter.companyId))
    if (filter.assignedUserId) conditions.push(eq(dealsTable.assignedUserId, filter.assignedUserId))
    if (filter.search) {
      conditions.push(ilike(dealsTable.name, `%${filter.search}%`))
    }

    const rows = await this.db.query.deals.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      orderBy: (deals, { desc }) => [desc(deals.createdAt)],
    })
    return rows.map(PipelineMapper.dealToDomain)
  }

  async save(deal: Deal): Promise<void> {
    const row = PipelineMapper.dealToPersistence(deal)
    await this.db.insert(dealsTable).values(row).onConflictDoUpdate({
      target: dealsTable.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(dealsTable).where(
      and(eq(dealsTable.tenantId, tenantId), eq(dealsTable.id, id)),
    )
  }
}
