import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { AffiliateProgramRepository, AffiliateProgramFilters } from "@/src/domain/crm/affiliates/affiliate-program.repository"
import type { AffiliateProgram } from "@/src/domain/crm/affiliates/affiliate-program.entity"

export class ListProgramsUseCase {
  constructor(private repository: AffiliateProgramRepository) {}

  async execute(filters?: AffiliateProgramFilters, pagination?: Pagination): Promise<Result<PaginatedResult<AffiliateProgram>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
