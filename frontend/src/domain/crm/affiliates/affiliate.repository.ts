import type { Repository } from "../common/repositories/repository.interface"
import type { Affiliate, AffiliateCreateInput } from "./affiliate.entity"

export interface AffiliateFilters {
  programId?: string
  status?: string
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export type AffiliateRepository = Repository<Affiliate, AffiliateCreateInput, Record<string, never>, AffiliateFilters>
