import { Injectable } from '@nestjs/common'
import { eq, and, asc } from 'drizzle-orm'
import { getDb, pipelineStages as pipelineStagesTable } from '@crm/database'
import { PipelineStageRepository } from '../domain/repositories/pipeline-stage.repository'
import { PipelineStage } from '../domain/entities/pipeline-stage.entity'
import { PipelineMapper } from './pipeline.mapper'

@Injectable()
export class DrizzlePipelineStageRepository extends PipelineStageRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<PipelineStage | null> {
    const row = await this.db.query.pipelineStages.findFirst({
      where: and(eq(pipelineStagesTable.tenantId, tenantId), eq(pipelineStagesTable.id, id)),
    })
    return row ? PipelineMapper.stageToDomain(row) : null
  }

  async findByPipelineId(tenantId: string, pipelineId: string): Promise<PipelineStage[]> {
    const rows = await this.db.query.pipelineStages.findMany({
      where: and(eq(pipelineStagesTable.tenantId, tenantId), eq(pipelineStagesTable.pipelineId, pipelineId)),
    })
    return rows.map(PipelineMapper.stageToDomain)
  }

  async listOrdered(tenantId: string, pipelineId: string): Promise<PipelineStage[]> {
    const rows = await this.db.query.pipelineStages.findMany({
      where: and(eq(pipelineStagesTable.tenantId, tenantId), eq(pipelineStagesTable.pipelineId, pipelineId)),
      orderBy: [asc(pipelineStagesTable.displayOrder), asc(pipelineStagesTable.createdAt)],
    })
    return rows.map(PipelineMapper.stageToDomain)
  }

  async save(stage: PipelineStage): Promise<void> {
    const row = PipelineMapper.stageToPersistence(stage)
    await this.db.insert(pipelineStagesTable).values(row).onConflictDoUpdate({
      target: pipelineStagesTable.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(pipelineStagesTable).where(
      and(eq(pipelineStagesTable.tenantId, tenantId), eq(pipelineStagesTable.id, id)),
    )
  }

  async reorder(tenantId: string, pipelineId: string, stageIds: string[]): Promise<void> {
    const stages = await this.findByPipelineId(tenantId, pipelineId)
    const stageMap = new Map(stages.map(s => [s.id, s]))

    for (let i = 0; i < stageIds.length; i++) {
      const stage = stageMap.get(stageIds[i])
      if (!stage) continue
      const updated = new PipelineStage(
        stage.id,
        stage.tenantId,
        stage.pipelineId,
        stage.name,
        stage.probabilityPercent,
        i,
        stage.createdAt,
      )
      await this.save(updated)
    }
  }
}
