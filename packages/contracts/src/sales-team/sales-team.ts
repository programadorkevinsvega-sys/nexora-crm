import { z } from 'zod'

export const SalesTeamSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(100),
  managerUserId: z.string().uuid().nullable(),
  monthlyTarget: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type SalesTeam = z.infer<typeof SalesTeamSchema>

export const CreateSalesTeamSchema = z.object({
  name: z.string().min(1).max(100),
  managerUserId: z.string().uuid().nullable().optional(),
  monthlyTarget: z.number().default(0),
})
export type CreateSalesTeam = z.infer<typeof CreateSalesTeamSchema>

export const SalesQuotaSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  teamId: z.string().uuid().nullable(),
  periodMonth: z.number().int().min(1).max(12),
  periodYear: z.number().int(),
  targetAmount: z.number(),
  achievedAmount: z.number().default(0),
  createdAt: z.string().datetime(),
})
export type SalesQuota = z.infer<typeof SalesQuotaSchema>

export const CreateQuotaSchema = z.object({
  userId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  periodMonth: z.number().int().min(1).max(12),
  periodYear: z.number().int(),
  targetAmount: z.number(),
})
export type CreateQuota = z.infer<typeof CreateQuotaSchema>
