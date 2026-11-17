import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IPipelineRepository } from "@/src/domain/crm/pipelines/pipeline.repository"
import type { Pipeline, PipelineUpdateInput } from "@/src/domain/crm/pipelines/pipeline.entity"

export class UpdatePipelineUseCase {
  constructor(private repository: IPipelineRepository) {}

  async execute(id: string, data: PipelineUpdateInput): Promise<Result<Pipeline>> {
    try {
      const pipeline = await this.repository.update(id, data)
      return success(pipeline)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
