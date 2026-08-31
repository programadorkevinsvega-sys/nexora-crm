import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { AffiliateRepository, AffiliateFilters } from "@/src/domain/crm/affiliates/affiliate.repository"
import type { Affiliate } from "@/src/domain/crm/affiliates/affiliate.entity"

export class ListAffiliatesUseCase {
  constructor(private repository: AffiliateRepository) {}

  async execute(filters?: AffiliateFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Affiliate>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
