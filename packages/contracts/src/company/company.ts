import { z } from 'zod'

export const CompanySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  taxId: z.string().max(100).nullable(),
  website: z.string().max(255).nullable(),
  industry: z.string().max(100).nullable(),
  numberOfEmployees: z.number().int().nullable(),
  annualRevenue: z.number().nullable(),
  description: z.string().nullable(),
  parentCompanyId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Company = z.infer<typeof CompanySchema>

export const CreateCompanySchema = z.object({
  name: z.string().min(1).max(255),
  taxId: z.string().max(100).nullable().optional(),
  website: z.string().max(255).nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  numberOfEmployees: z.number().int().nullable().optional(),
  annualRevenue: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  parentCompanyId: z.string().uuid().nullable().optional(),
})
export type CreateCompany = z.infer<typeof CreateCompanySchema>

export const UpdateCompanySchema = CreateCompanySchema.partial()
export type UpdateCompany = z.infer<typeof UpdateCompanySchema>

export const CompanyFilterSchema = z.object({
  search: z.string().optional(),
  industry: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type CompanyFilter = z.infer<typeof CompanyFilterSchema>
