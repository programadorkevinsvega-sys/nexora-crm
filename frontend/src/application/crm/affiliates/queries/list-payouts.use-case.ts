import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { AffiliatePayoutRepository, PayoutFilters } from "@/src/domain/crm/affiliates/affiliate-payout.repository"
import type { AffiliatePayout } from "@/src/domain/crm/affiliates/affiliate-payout.entity"

export class ListPayoutsUseCase {
  constructor(private repository: AffiliatePayoutRepository) {}

  async execute(affiliateId: string, filters?: PayoutFilters, pagination?: Pagination): Promise<Result<PaginatedResult<AffiliatePayout>>> {
    try {
      const result = await this.repository.listByAffiliateId(affiliateId, filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
