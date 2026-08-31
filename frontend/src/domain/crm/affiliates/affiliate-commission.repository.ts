import type { PaginatedResult } from "../common/results/paginated-result"
import type { Pagination } from "../common/value-objects/Pagination"
import type { AffiliateCommission, CommissionCreateInput } from "./affiliate-commission.entity"

export interface CommissionFilters {
  status?: string
  cursor?: string
  limit?: number
}

export interface AffiliateCommissionRepository {
  listByAffiliateId(affiliateId: string, filters?: CommissionFilters, pagination?: Pagination): Promise<PaginatedResult<AffiliateCommission>>
  create(data: CommissionCreateInput): Promise<AffiliateCommission>
}
