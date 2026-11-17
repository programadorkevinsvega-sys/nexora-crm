import { z } from 'zod'

export const PartnerTierCodeSchema = z.enum(['SILVER', 'GOLD', 'PLATINUM'])
export type PartnerTierCode = z.infer<typeof PartnerTierCodeSchema>

export const PartnerStatusSchema = z.enum(['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED'])
export type PartnerStatus = z.infer<typeof PartnerStatusSchema>

export const DealRegistrationStatusSchema = z.enum(['SUBMITTED', 'APPROVED', 'EXPIRED', 'REJECTED', 'CONVERTED'])
export type DealRegistrationStatus = z.infer<typeof DealRegistrationStatusSchema>

export const PartnerTierSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  code: PartnerTierCodeSchema,
  minAnnualRevenueUsd: z.number(),
  discountMarginPct: z.number(),
  mdfAllowanceUsd: z.number(),
  benefits: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type PartnerTier = z.infer<typeof PartnerTierSchema>

export const PartnerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  companyId: z.string().uuid().nullable().optional(),
  tierId: z.string().uuid(),
  partnerName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().nullable().optional(),
  status: PartnerStatusSchema,
  joinedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Partner = z.infer<typeof PartnerSchema>

export const CreatePartnerDtoSchema = z.object({
  companyId: z.string().uuid().optional(),
  tierId: z.string().uuid(),
  partnerName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  status: PartnerStatusSchema.default('ACTIVE').optional(),
})
export type CreatePartnerDto = z.infer<typeof CreatePartnerDtoSchema>

export const PartnerDealRegistrationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  partnerId: z.string().uuid(),
  prospectCompanyName: z.string().min(1),
  contactEmail: z.string().email(),
  estimatedValueUsd: z.number(),
  productCategory: z.string(),
  status: DealRegistrationStatusSchema,
  protectedUntil: z.string().nullable().optional(),
  convertedDealId: z.string().uuid().nullable().optional(),
  reviewedByUserId: z.string().uuid().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type PartnerDealRegistration = z.infer<typeof PartnerDealRegistrationSchema>

export const CreateDealRegistrationDtoSchema = z.object({
  partnerId: z.string().uuid(),
  prospectCompanyName: z.string().min(2),
  contactEmail: z.string().email(),
  estimatedValueUsd: z.number().min(1),
  productCategory: z.string().default('SAAS_ENTERPRISE').optional(),
  notes: z.string().optional(),
})
export type CreateDealRegistrationDto = z.infer<typeof CreateDealRegistrationDtoSchema>
