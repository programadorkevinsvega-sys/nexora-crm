import type { Repository } from "../common/repositories/repository.interface"
import type { Quote, QuoteCreateInput } from "./quote.entity"

export interface QuoteFilters {
  dealId?: string
  status?: string
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export type QuoteRepository = Repository<Quote, QuoteCreateInput, Record<string, never>, QuoteFilters>
