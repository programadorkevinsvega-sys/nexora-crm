import { z } from 'zod'

export const LoyaltyProfileSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid(),
  loyaltyPointsBalance: z.number().int().default(0),
  tierLevel: z.string().max(50).default('BRONZE'),
  totalLifetimeValue: z.number().default(0),
  totalPurchasesCount: z.number().int().default(0),
  averageOrderValue: z.number().default(0),
  lastPurchaseDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type LoyaltyProfile = z.infer<typeof LoyaltyProfileSchema>

export const EarnPointsSchema = z.object({
  contactId: z.string().uuid(),
  points: z.number().int().positive(),
})
export type EarnPoints = z.infer<typeof EarnPointsSchema>

export const RedeemPointsSchema = z.object({
  contactId: z.string().uuid(),
  points: z.number().int().positive(),
})
export type RedeemPoints = z.infer<typeof RedeemPointsSchema>
