import type { PaginatedResult } from "../common/results/paginated-result"
import type { Pagination } from "../common/value-objects/Pagination"
import type { AffiliatePayout, PayoutCreateInput } from "./affiliate-payout.entity"

export interface PayoutFilters {
  status?: string
  cursor?: string
  limit?: number
}

export interface AffiliatePayoutRepository {
  listByAffiliateId(affiliateId: string, filters?: PayoutFilters, pagination?: Pagination): Promise<PaginatedResult<AffiliatePayout>>
  create(data: PayoutCreateInput): Promise<AffiliatePayout>
}
