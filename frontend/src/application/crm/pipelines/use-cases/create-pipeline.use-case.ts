import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IPipelineRepository } from "@/src/domain/crm/pipelines/pipeline.repository"
import type { Pipeline, PipelineCreateInput } from "@/src/domain/crm/pipelines/pipeline.entity"

export class CreatePipelineUseCase {
  constructor(private repository: IPipelineRepository) {}

  async execute(data: PipelineCreateInput): Promise<Result<Pipeline>> {
    try {
      const pipeline = await this.repository.create(data)
      return success(pipeline)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
