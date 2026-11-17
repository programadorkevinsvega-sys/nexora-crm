import { z } from 'zod'

export const AffiliateCommissionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  affiliateId: z.string().uuid(),
  sourceOrderId: z.string().uuid(),
  commissionAmount: z.number().positive(),
  mlmLevelEarned: z.number().int().default(0),
  status: z.enum(['PENDING', 'APPROVED', 'PAID', 'CANCELLED']).default('PENDING'),
  approvedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
})
export type AffiliateCommission = z.infer<typeof AffiliateCommissionSchema>

export const RecordCommissionSchema = z.object({
  sourceOrderId: z.string().uuid(),
  commissionAmount: z.number().positive(),
  mlmLevelEarned: z.number().int().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'PAID', 'CANCELLED']).optional(),
  approvedAt: z.string().optional(),
})
export type RecordCommission = z.infer<typeof RecordCommissionSchema>
