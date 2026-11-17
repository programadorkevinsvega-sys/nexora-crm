import { z } from 'zod'

export const HealthStatusSchema = z.enum(['HEALTHY', 'NEUTRAL', 'AT_RISK', 'CRITICAL'])
export type HealthStatus = z.infer<typeof HealthStatusSchema>

export const CustomerHealthScoreSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  healthScore: z.number().int().min(0).max(100),
  status: HealthStatusSchema,
  engagementScore: z.number().int().min(0).max(30),
  supportScore: z.number().int().min(0).max(25),
  financialScore: z.number().int().min(0).max(25),
  recencyScore: z.number().int().min(0).max(20),
  churnProbability: z.number().min(0).max(100),
  primaryRiskFactor: z.string().nullable().optional(),
  recommendedAction: z.string().nullable().optional(),
  lastCalculatedAt: z.string(),
})
export type CustomerHealthScore = z.infer<typeof CustomerHealthScoreSchema>

export const CalculateHealthScoreDtoSchema = z.object({
  contactId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
})
export type CalculateHealthScoreDto = z.infer<typeof CalculateHealthScoreDtoSchema>
