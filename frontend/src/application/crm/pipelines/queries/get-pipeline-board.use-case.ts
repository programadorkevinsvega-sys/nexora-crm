import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IPipelineRepository } from "@/src/domain/crm/pipelines/pipeline.repository"
import type { PipelineBoard } from "@/src/domain/crm/pipelines/pipeline.entity"

export class GetPipelineBoardUseCase {
  constructor(private repository: IPipelineRepository) {}

  async execute(pipelineId: string): Promise<Result<PipelineBoard>> {
    try {
      const board = await this.repository.getBoard(pipelineId)
      return success(board)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
