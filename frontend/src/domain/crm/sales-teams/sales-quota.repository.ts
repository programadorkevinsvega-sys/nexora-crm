import type { PaginatedResult } from "../common/results/paginated-result"
import type { Pagination } from "../common/value-objects/Pagination"
import type { SalesQuota, SalesQuotaCreateInput } from "./sales-quota.entity"

export interface SalesQuotaFilters {
  teamId?: string
  userId?: string
  periodYear?: number
  periodMonth?: number
}

export interface SalesQuotaRepository {
  list(filters?: SalesQuotaFilters, pagination?: Pagination): Promise<PaginatedResult<SalesQuota>>
  create(data: SalesQuotaCreateInput): Promise<SalesQuota>
}
