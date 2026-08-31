import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { getDb, pipelines as pipelinesTable } from '@crm/database'
import { PipelineRepository } from '../domain/repositories/pipeline.repository'
import { Pipeline } from '../domain/entities/pipeline.entity'
import { PipelineMapper } from './pipeline.mapper'

@Injectable()
export class DrizzlePipelineRepository extends PipelineRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<Pipeline | null> {
    const row = await this.db.query.pipelines.findFirst({
      where: and(eq(pipelinesTable.tenantId, tenantId)!, eq(pipelinesTable.id, id)) as any,
    })
    return row ? PipelineMapper.toDomain(row) : null
  }

  async findByTenantId(tenantId: string): Promise<Pipeline[]> {
    const rows = await this.db.query.pipelines.findMany({
      where: eq(pipelinesTable.tenantId, tenantId),
    })
    return rows.map(PipelineMapper.toDomain)
  }

  async list(tenantId: string): Promise<Pipeline[]> {
    const rows = await this.db.query.pipelines.findMany({
      where: eq(pipelinesTable.tenantId, tenantId),
      orderBy: (pipelines, { asc }) => [asc(pipelines.createdAt)],
    })
    return rows.map(PipelineMapper.toDomain)
  }

  async save(pipeline: Pipeline): Promise<void> {
    const row = PipelineMapper.toPersistence(pipeline)
    await this.db.insert(pipelinesTable).values(row).onConflictDoUpdate({
      target: pipelinesTable.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(pipelinesTable).where(
      and(eq(pipelinesTable.tenantId, tenantId), eq(pipelinesTable.id, id)),
    )
  }
}
