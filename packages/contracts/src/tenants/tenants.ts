import { z } from 'zod'

export const TenantStatus = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL'])
export type TenantStatus = z.infer<typeof TenantStatus>

export const CreateTenantSchema = z.object({
  name: z.string().min(1).max(255),
  legalName: z.string().max(255).optional(),
  taxId: z.string().max(100).optional(),
  taxRegime: z.string().max(100).optional(),
  legalAddress: z.string().optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  industryType: z.string().min(1).max(100),
  timezone: z.string().max(100).default('UTC'),
  currencyCode: z.string().max(10).default('USD'),
  ownerUserId: z.string().uuid(),
})
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>

export const UpdateTenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  legalName: z.string().max(255).nullable().optional(),
  taxId: z.string().max(100).nullable().optional(),
  taxRegime: z.string().max(100).nullable().optional(),
  legalAddress: z.string().nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  postalCode: z.string().max(20).nullable().optional(),
  industryType: z.string().max(100).optional(),
  status: TenantStatus.optional(),
  timezone: z.string().max(100).optional(),
  currencyCode: z.string().max(10).optional(),
})
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>

export const CreateBranchSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  code: z.string().max(50).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  isHeadquarters: z.boolean().optional(),
})
export type CreateBranchInput = z.infer<typeof CreateBranchSchema>

export const UpdateBranchSchema = z.object({
  tenantId: z.string().uuid(),
  id: z.string().uuid(),
  name: z.string().max(255).optional(),
  code: z.string().max(50).nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
  isHeadquarters: z.boolean().optional(),
})
export type UpdateBranchInput = z.infer<typeof UpdateBranchSchema>

export const UpdateBrandingSchema = z.object({
  tenantId: z.string().uuid(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  primaryColor: z.string().max(20).optional(),
  secondaryColor: z.string().max(20).optional(),
  customDomain: z.string().max(255).optional(),
})
export type UpdateBrandingInput = z.infer<typeof UpdateBrandingSchema>

export const ToggleFeatureSchema = z.object({
  tenantId: z.string().uuid(),
  featureCode: z.string().min(1).max(100),
  isEnabled: z.boolean(),
})
export type ToggleFeatureInput = z.infer<typeof ToggleFeatureSchema>

export const CreateDomainSchema = z.object({
  tenantId: z.string().uuid(),
  domain: z.string().min(1).max(255),
  isPrimary: z.boolean().optional(),
})
export type CreateDomainInput = z.infer<typeof CreateDomainSchema>

export const UpsertMetricSchema = z.object({
  tenantId: z.string().uuid(),
  metricName: z.string().min(1).max(100),
  currentValue: z.number().int(),
  limitValue: z.number().int().optional(),
  periodStart: z.string(),
  periodEnd: z.string(),
})
export type UpsertMetricInput = z.infer<typeof UpsertMetricSchema>

export const InstallModuleSchema = z.object({
  tenantId: z.string().uuid(),
  moduleId: z.string().uuid(),
})
export type InstallModuleInput = z.infer<typeof InstallModuleSchema>

export const ListTenantsQuerySchema = z.object({
  search: z.string().optional(),
  status: TenantStatus.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
})
export type ListTenantsQueryInput = z.infer<typeof ListTenantsQuerySchema>
