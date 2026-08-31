import { z } from 'zod'

export const QuoteSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  dealId: z.string().uuid().nullable(),
  quoteNumber: z.string().min(1).max(100),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).default('DRAFT'),
  validUntil: z.string(),
  termsAndConditions: z.string().nullable(),
  subtotal: z.number().default(0),
  taxTotal: z.number().default(0),
  grandTotal: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Quote = z.infer<typeof QuoteSchema>

export const CreateQuoteSchema = z.object({
  dealId: z.string().uuid().nullable().optional(),
  quoteNumber: z.string().min(1).max(100),
  validUntil: z.string(),
  termsAndConditions: z.string().nullable().optional(),
  subtotal: z.number().default(0),
  taxTotal: z.number().default(0),
  grandTotal: z.number().default(0),
})
export type CreateQuote = z.infer<typeof CreateQuoteSchema>
