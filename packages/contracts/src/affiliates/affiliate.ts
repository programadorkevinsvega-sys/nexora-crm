import { z } from 'zod'

export const AffiliateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  programId: z.string().uuid(),
  customerId: z.string().uuid(),
  referralCode: z.string().min(1).max(100),
  referralLink: z.string().max(500),
  parentAffiliateId: z.string().uuid().nullable(),
  mlmLevel: z.number().int().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  totalEarnings: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Affiliate = z.infer<typeof AffiliateSchema>

export const RegisterAffiliateSchema = z.object({
  programId: z.string().uuid(),
  customerId: z.string().uuid(),
  referralCode: z.string().min(1).max(100),
  referralLink: z.string().max(500),
  parentAffiliateId: z.string().uuid().optional(),
  mlmLevel: z.number().int().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
})
export type RegisterAffiliate = z.infer<typeof RegisterAffiliateSchema>
