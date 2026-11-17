import { SalesQuota } from '../entities/sales-quota.entity'

export interface SalesQuotaFilter {
  userId?: string
  periodMonth?: number
  periodYear?: number
  cursor?: string
  limit: number
}

export interface PaginatedSalesQuotas {
  data: SalesQuota[]
  nextCursor: string | null
}

export abstract class SalesQuotaRepository {
  abstract findById(tenantId: string, id: string): Promise<SalesQuota | null>
  abstract listByTeam(tenantId: string, teamId: string, filter: SalesQuotaFilter): Promise<PaginatedSalesQuotas>
  abstract listByUser(tenantId: string, userId: string, filter: SalesQuotaFilter): Promise<PaginatedSalesQuotas>
  abstract save(quota: SalesQuota): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
