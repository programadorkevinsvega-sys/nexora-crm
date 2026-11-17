import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { IDealRepository, DealFilters } from "@/src/domain/crm/deals/deal.repository"
import type { Deal } from "@/src/domain/crm/deals/deal.entity"

export class ListDealsUseCase {
  constructor(private repository: IDealRepository) {}

  async execute(filters?: DealFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Deal>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
