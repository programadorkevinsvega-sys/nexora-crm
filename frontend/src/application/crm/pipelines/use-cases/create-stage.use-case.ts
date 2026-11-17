import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IPipelineRepository } from "@/src/domain/crm/pipelines/pipeline.repository"
import type { Stage, StageCreateInput } from "@/src/domain/crm/pipelines/stage.entity"

export class CreateStageUseCase {
  constructor(private repository: IPipelineRepository) {}

  async execute(data: StageCreateInput): Promise<Result<Stage>> {
    try {
      const { pipelineId, ...rest } = data
      const stage = await this.repository.createStage(pipelineId, rest)
      return success(stage)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
