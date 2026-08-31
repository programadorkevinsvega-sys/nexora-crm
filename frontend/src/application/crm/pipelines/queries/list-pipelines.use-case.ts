import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { PipelineRepository, PipelineFilters } from "@/src/domain/crm/pipelines/pipeline.repository"
import type { Pipeline } from "@/src/domain/crm/pipelines/pipeline.entity"

export class ListPipelinesUseCase {
  constructor(private repository: PipelineRepository) {}

  async execute(filters?: PipelineFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Pipeline>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
