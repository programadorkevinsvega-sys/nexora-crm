import { z } from 'zod'

export const AffiliateProgramSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  commissionType: z.enum(['PERCENTAGE', 'FIXED']),
  commissionValue: z.number().positive(),
  cookieDurationDays: z.number().int().default(30),
  isMultiLevel: z.boolean().default(false),
  maxMlmLevels: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type AffiliateProgram = z.infer<typeof AffiliateProgramSchema>

export const CreateProgramSchema = z.object({
  name: z.string().min(1).max(255),
  commissionType: z.enum(['PERCENTAGE', 'FIXED']),
  commissionValue: z.number().positive(),
  cookieDurationDays: z.number().int().nullable().optional(),
  isMultiLevel: z.boolean().nullable().optional(),
  maxMlmLevels: z.number().int().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
})
export type CreateProgram = z.infer<typeof CreateProgramSchema>

export const UpdateProgramSchema = CreateProgramSchema.partial()
export type UpdateProgram = z.infer<typeof UpdateProgramSchema>
