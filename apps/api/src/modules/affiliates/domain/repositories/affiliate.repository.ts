import { Affiliate } from '../entities/affiliate.entity'

export interface AffiliateFilter {
  programId?: string
  status?: string
  search?: string
  cursor?: string
  limit: number
}

export interface PaginatedAffiliates {
  data: Affiliate[]
  nextCursor: string | null
}

export abstract class AffiliateRepository {
  abstract findById(tenantId: string, id: string): Promise<Affiliate | null>
  abstract findByReferralCode(tenantId: string, referralCode: string): Promise<Affiliate | null>
  abstract list(tenantId: string, filter: AffiliateFilter): Promise<PaginatedAffiliates>
  abstract save(affiliate: Affiliate): Promise<void>
}
