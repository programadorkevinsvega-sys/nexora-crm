import { z } from 'zod'

export const AffiliatePayoutSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  affiliateId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.string().max(50).nullable(),
  paymentReference: z.string().max(255).nullable(),
  status: z.enum(['PENDING', 'PROCESSED', 'FAILED', 'CANCELLED']).default('PENDING'),
  paidAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
})
export type AffiliatePayout = z.infer<typeof AffiliatePayoutSchema>

export const ProcessPayoutSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.string().max(50).optional(),
  paymentReference: z.string().max(255).optional(),
  status: z.enum(['PENDING', 'PROCESSED', 'FAILED', 'CANCELLED']).optional(),
  paidAt: z.string().optional(),
})
export type ProcessPayout = z.infer<typeof ProcessPayoutSchema>
