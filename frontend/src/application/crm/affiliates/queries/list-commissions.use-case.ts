import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { AffiliateCommissionRepository, CommissionFilters } from "@/src/domain/crm/affiliates/affiliate-commission.repository"
import type { AffiliateCommission } from "@/src/domain/crm/affiliates/affiliate-commission.entity"

export class ListCommissionsUseCase {
  constructor(private repository: AffiliateCommissionRepository) {}

  async execute(affiliateId: string, filters?: CommissionFilters, pagination?: Pagination): Promise<Result<PaginatedResult<AffiliateCommission>>> {
    try {
      const result = await this.repository.listByAffiliateId(affiliateId, filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
