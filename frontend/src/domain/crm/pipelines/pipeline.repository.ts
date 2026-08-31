import type { Repository } from "../common/repositories/repository.interface"
import type { Pipeline, PipelineCreateInput, PipelineUpdateInput } from "./pipeline.entity"
import type { Stage, StageCreateInput } from "./stage.entity"
import type { PipelineBoard } from "./pipeline.entity"

export interface PipelineFilters {
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export interface IPipelineRepository extends Repository<Pipeline, PipelineCreateInput, PipelineUpdateInput, PipelineFilters> {
  getBoard(pipelineId: string): Promise<PipelineBoard>
  createStage(pipelineId: string, data: Omit<StageCreateInput, "pipelineId">): Promise<Stage>
  reorderStages(pipelineId: string, stageIds: string[]): Promise<Stage[]>
}

export type PipelineRepository = IPipelineRepository

