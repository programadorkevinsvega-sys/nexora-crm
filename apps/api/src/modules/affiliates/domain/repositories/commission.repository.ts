import { AffiliateCommission } from '../entities/affiliate-commission.entity'
import { AffiliatePayout } from '../entities/affiliate-payout.entity'

export interface CommissionFilter {
  affiliateId?: string
  status?: string
  cursor?: string
  limit: number
}

export interface PayoutFilter {
  affiliateId?: string
  status?: string
  cursor?: string
  limit: number
}

export interface PaginatedCommissions {
  data: AffiliateCommission[]
  nextCursor: string | null
}

export interface PaginatedPayouts {
  data: AffiliatePayout[]
  nextCursor: string | null
}

export abstract class CommissionRepository {
  abstract findCommissionById(tenantId: string, id: string): Promise<AffiliateCommission | null>
  abstract listCommissions(tenantId: string, filter: CommissionFilter): Promise<PaginatedCommissions>
  abstract saveCommission(commission: AffiliateCommission): Promise<void>

  abstract findPayoutById(tenantId: string, id: string): Promise<AffiliatePayout | null>
  abstract listPayouts(tenantId: string, filter: PayoutFilter): Promise<PaginatedPayouts>
  abstract savePayout(payout: AffiliatePayout): Promise<void>
}
