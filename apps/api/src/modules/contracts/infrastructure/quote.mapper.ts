import { Quote } from '../domain/entities/quote.entity'

type QuoteRow = {
  id: string
  tenantId: string
  dealId: string | null
  quoteNumber: string
  status: string | null
  validUntil: string
  termsAndConditions: string | null
  subtotal: string | null
  taxTotal: string | null
  grandTotal: string | null
  createdAt: Date
  updatedAt: Date
}

export class QuoteMapper {
  static toDomain(row: QuoteRow): Quote {
    return new Quote(
      row.id,
      row.tenantId,
      row.dealId,
      row.quoteNumber,
      row.status as Quote['status'],
      row.validUntil,
      row.termsAndConditions,
      Number(row.subtotal ?? 0),
      Number(row.taxTotal ?? 0),
      Number(row.grandTotal ?? 0),
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(quote: Quote): QuoteRow {
    return {
      id: quote.id,
      tenantId: quote.tenantId,
      dealId: quote.dealId,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      validUntil: quote.validUntil,
      termsAndConditions: quote.termsAndConditions,
      subtotal: quote.subtotal.toString(),
      taxTotal: quote.taxTotal.toString(),
      grandTotal: quote.grandTotal.toString(),
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    }
  }

  static toResponse(quote: Quote) {
    return {
      id: quote.id,
      dealId: quote.dealId,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      validUntil: quote.validUntil,
      termsAndConditions: quote.termsAndConditions,
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      grandTotal: quote.grandTotal,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
    }
  }
}
