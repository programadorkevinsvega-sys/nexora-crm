import { z } from 'zod'

export const CompanySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  taxId: z.string().max(100).nullable().optional(),
  website: z.string().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().email().nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  address: z.string().nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  numberOfEmployees: z.number().int().nullable().optional(),
  annualRevenue: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  parentCompanyId: z.string().uuid().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  lifecycleStage: z.enum(['LEAD', 'PROSPECT', 'CUSTOMER', 'CHURNED', 'PARTNER']).default('PROSPECT').optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  healthScore: z.number().int().min(0).max(100).default(100).optional(),
  tier: z.enum(['TIER_1_VIP', 'TIER_2', 'TIER_3']).default('TIER_2').optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Company = z.infer<typeof CompanySchema>

export const CreateCompanySchema = z.object({
  name: z.string().min(1).max(255),
  taxId: z.string().max(100).nullable().optional(),
  website: z.string().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().email().nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  address: z.string().nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  numberOfEmployees: z.number().int().nullable().optional(),
  annualRevenue: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  parentCompanyId: z.string().uuid().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  lifecycleStage: z.enum(['LEAD', 'PROSPECT', 'CUSTOMER', 'CHURNED', 'PARTNER']).default('PROSPECT').optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  healthScore: z.number().int().min(0).max(100).default(100).optional(),
  tier: z.enum(['TIER_1_VIP', 'TIER_2', 'TIER_3']).default('TIER_2').optional(),
})
export type CreateCompany = z.infer<typeof CreateCompanySchema>

export const UpdateCompanySchema = CreateCompanySchema.partial()
export type UpdateCompany = z.infer<typeof UpdateCompanySchema>

export const CompanyFilterSchema = z.object({
  search: z.string().optional(),
  industry: z.string().optional(),
  lifecycleStage: z.string().optional(),
  tier: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type CompanyFilter = z.infer<typeof CompanyFilterSchema>
