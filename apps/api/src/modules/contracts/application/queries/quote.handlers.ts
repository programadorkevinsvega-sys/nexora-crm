import { Injectable } from '@nestjs/common'
import { QuoteRepository } from '../../domain/repositories/quote.repository'
import { GetQuoteQuery, ListQuotesQuery } from './quote.queries'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class GetQuoteHandler {
  constructor(private readonly repo: QuoteRepository) {}

  async execute(query: GetQuoteQuery) {
    const quote = await this.repo.findById(query.tenantId, query.id)
    if (!quote) throw new NotFoundError('Quote', query.id)
    return quote
  }
}

@Injectable()
export class ListQuotesHandler {
  constructor(private readonly repo: QuoteRepository) {}

  async execute(query: ListQuotesQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}
