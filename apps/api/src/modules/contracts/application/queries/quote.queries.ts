import { QuoteFilter } from '../../domain/repositories/quote.repository'

export class GetQuoteQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListQuotesQuery {
  constructor(readonly tenantId: string, readonly filter: QuoteFilter) {}
}
