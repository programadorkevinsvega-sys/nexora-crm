import { PipelineStage } from '../entities/pipeline-stage.entity'

export abstract class PipelineStageRepository {
  abstract findById(tenantId: string, id: string): Promise<PipelineStage | null>
  abstract findByPipelineId(tenantId: string, pipelineId: string): Promise<PipelineStage[]>
  abstract listOrdered(tenantId: string, pipelineId: string): Promise<PipelineStage[]>
  abstract save(stage: PipelineStage): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
  abstract reorder(tenantId: string, pipelineId: string, stageIds: string[]): Promise<void>
}
