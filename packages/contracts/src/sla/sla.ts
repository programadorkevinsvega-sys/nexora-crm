import { z } from 'zod'

export const SlaPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'])
export type SlaPriority = z.infer<typeof SlaPrioritySchema>

export const SlaActionTypeSchema = z.enum(['NOTIFY_MANAGER', 'REASSIGN_TEAM', 'PAGE_ON_CALL', 'RAISE_PRIORITY'])
export type SlaActionType = z.infer<typeof SlaActionTypeSchema>

export const SlaPolicySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  priority: SlaPrioritySchema,
  firstResponseTimeMinutes: z.number(),
  resolutionTimeMinutes: z.number(),
  businessHoursOnly: z.boolean(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type SlaPolicy = z.infer<typeof SlaPolicySchema>

export const CreateSlaPolicyDtoSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  priority: SlaPrioritySchema.default('HIGH'),
  firstResponseTimeMinutes: z.number().min(5).default(60),
  resolutionTimeMinutes: z.number().min(15).default(240),
  businessHoursOnly: z.boolean().default(true).optional(),
  isDefault: z.boolean().default(false).optional(),
  isActive: z.boolean().default(true).optional(),
})
export type CreateSlaPolicyDto = z.infer<typeof CreateSlaPolicyDtoSchema>

export const SlaEscalationRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  policyId: z.string().uuid(),
  level: z.number(),
  triggerAfterMinutes: z.number(),
  actionType: SlaActionTypeSchema,
  targetUserId: z.string().uuid().nullable().optional(),
  targetTeamId: z.string().uuid().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
})
export type SlaEscalationRule = z.infer<typeof SlaEscalationRuleSchema>

export const CreateSlaEscalationRuleDtoSchema = z.object({
  policyId: z.string().uuid(),
  level: z.number().min(1).max(3).default(1),
  triggerAfterMinutes: z.number().min(1),
  actionType: SlaActionTypeSchema.default('NOTIFY_MANAGER'),
  targetUserId: z.string().uuid().optional(),
  targetTeamId: z.string().uuid().optional(),
  isActive: z.boolean().default(true).optional(),
})
export type CreateSlaEscalationRuleDto = z.infer<typeof CreateSlaEscalationRuleDtoSchema>

export const TicketSlaTrackerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  ticketId: z.string().uuid(),
  policyId: z.string().uuid(),
  firstResponseDueAt: z.string(),
  firstRespondedAt: z.string().nullable().optional(),
  resolutionDueAt: z.string(),
  resolvedAt: z.string().nullable().optional(),
  isFirstResponseBreached: z.boolean(),
  isResolutionBreached: z.boolean(),
  escalationLevelReached: z.number(),
  updatedAt: z.string(),
})
export type TicketSlaTracker = z.infer<typeof TicketSlaTrackerSchema>
