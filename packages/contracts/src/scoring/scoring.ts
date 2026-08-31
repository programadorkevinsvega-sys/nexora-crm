import { z } from 'zod'

export const LeadTemperatureSchema = z.enum(['COLD', 'WARM', 'HOT'])
export type LeadTemperature = z.infer<typeof LeadTemperatureSchema>

export const ScoringRuleCategorySchema = z.enum(['DEMOGRAPHIC', 'BEHAVIORAL', 'ENGAGEMENT'])
export type ScoringRuleCategory = z.infer<typeof ScoringRuleCategorySchema>

export const ScoringConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'IN', 'IS_EMPTY']),
  value: z.unknown().optional(),
})
export type ScoringCondition = z.infer<typeof ScoringConditionSchema>

export const LeadScoringRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  category: ScoringRuleCategorySchema,
  condition: ScoringConditionSchema,
  points: z.number().int(),
  decayDays: z.number().int().positive().nullable().optional(),
  decayPoints: z.number().int().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type LeadScoringRule = z.infer<typeof LeadScoringRuleSchema>

export const CreateScoringRuleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: ScoringRuleCategorySchema,
  condition: ScoringConditionSchema,
  points: z.number().int(),
  decayDays: z.number().int().positive().optional(),
  decayPoints: z.number().int().optional(),
  isActive: z.boolean().default(true).optional(),
})
export type CreateScoringRule = z.infer<typeof CreateScoringRuleSchema>

export const ScoreAdjustmentLogSchema = z.object({
  ruleId: z.string().optional(),
  reason: z.string(),
  points: z.number(),
  appliedAt: z.string(),
})
export type ScoreAdjustmentLog = z.infer<typeof ScoreAdjustmentLogSchema>

export const LeadScoreSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid(),
  score: z.number().int(),
  temperature: LeadTemperatureSchema,
  lastActivityAt: z.string().datetime(),
  history: z.array(ScoreAdjustmentLogSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type LeadScore = z.infer<typeof LeadScoreSchema>

export const AdjustScoreSchema = z.object({
  contactId: z.string().uuid(),
  points: z.number().int(),
  reason: z.string().min(1),
  ruleId: z.string().uuid().optional(),
})
export type AdjustScore = z.infer<typeof AdjustScoreSchema>
