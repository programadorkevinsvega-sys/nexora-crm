import { z } from 'zod'

export const BranchSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  isHeadquarters: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Branch = z.infer<typeof BranchSchema>

export const CreateBranchDtoSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  isHeadquarters: z.boolean().default(false),
})

export type CreateBranchDto = z.infer<typeof CreateBranchDtoSchema>

export const TenantTaxSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  taxName: z.string().min(1),
  taxPercentage: z.number().min(0).max(100),
  taxType: z.enum(['SALES', 'PURCHASE', 'WITHHOLDING']).default('SALES'),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TenantTax = z.infer<typeof TenantTaxSchema>

export const CreateTenantTaxDtoSchema = z.object({
  taxName: z.string().min(1),
  taxPercentage: z.number().min(0).max(100),
  taxType: z.enum(['SALES', 'PURCHASE', 'WITHHOLDING']).default('SALES'),
  description: z.string().optional(),
})

export type CreateTenantTaxDto = z.infer<typeof CreateTenantTaxDtoSchema>

export const TenantCurrencySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  isoCode: z.string().length(3),
  name: z.string().min(1),
  symbol: z.string().min(1),
  isBaseCurrency: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TenantCurrency = z.infer<typeof TenantCurrencySchema>

export const CreateTenantCurrencyDtoSchema = z.object({
  isoCode: z.string().length(3),
  name: z.string().min(1),
  symbol: z.string().min(1),
  isBaseCurrency: z.boolean().default(false),
})

export type CreateTenantCurrencyDto = z.infer<typeof CreateTenantCurrencyDtoSchema>
