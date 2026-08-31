import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IPipelineRepository } from "@/src/domain/crm/pipelines/pipeline.repository"

export class ReorderStagesUseCase {
  constructor(private repository: IPipelineRepository) {}

  async execute(pipelineId: string, stageIds: string[]): Promise<Result<void>> {
    try {
      await this.repository.reorderStages(pipelineId, stageIds)
      return success(undefined)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
