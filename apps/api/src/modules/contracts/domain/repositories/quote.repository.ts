import { Quote } from '../entities/quote.entity'

export interface QuoteFilter {
  status?: string
  dealId?: string
  cursor?: string
  limit: number
}

export interface PaginatedQuotes {
  data: Quote[]
  nextCursor: string | null
}

export abstract class QuoteRepository {
  abstract findById(tenantId: string, id: string): Promise<Quote | null>
  abstract list(tenantId: string, filter: QuoteFilter): Promise<PaginatedQuotes>
  abstract save(quote: Quote): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
