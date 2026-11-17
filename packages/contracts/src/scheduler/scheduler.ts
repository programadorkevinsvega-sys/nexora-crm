import { z } from 'zod'

export const CreateSchedTaskSchema = z.object({
  tenantId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  cronExpression: z.string().min(1).max(100),
  taskType: z.string().min(1).max(100),
  targetService: z.string().max(150).optional(),
  targetEndpoint: z.string().max(500).optional(),
  targetPayload: z.record(z.unknown()).optional(),
  enabled: z.boolean().optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
  timeoutSeconds: z.number().int().min(1).max(86400).optional(),
  createdByUserId: z.string().uuid().optional(),
})
export type CreateSchedTask = z.infer<typeof CreateSchedTaskSchema>

export const UpdateSchedTaskSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  cronExpression: z.string().min(1).max(100).optional(),
  targetService: z.string().max(150).optional(),
  targetEndpoint: z.string().max(500).optional(),
  targetPayload: z.record(z.unknown()).optional(),
  enabled: z.boolean().optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
  timeoutSeconds: z.number().int().min(1).max(86400).optional(),
})
export type UpdateSchedTask = z.infer<typeof UpdateSchedTaskSchema>

export const ListSchedTasksSchema = z.object({
  tenantId: z.string().uuid().optional(),
  enabled: z.boolean().optional(),
  taskType: z.string().max(100).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
})
export type ListSchedTasks = z.infer<typeof ListSchedTasksSchema>

export const CreateSchedReminderSchema = z.object({
  tenantId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.string().uuid().optional(),
  remindAt: z.string().datetime(),
  repeatInterval: z.string().max(50).optional(),
  repeatCount: z.number().int().min(1).optional(),
})
export type CreateSchedReminder = z.infer<typeof CreateSchedReminderSchema>

export const ListSchedRemindersSchema = z.object({
  tenantId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.string().uuid().optional(),
  pendingOnly: z.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
})
export type ListSchedReminders = z.infer<typeof ListSchedRemindersSchema>

export const CreateSlaConfigSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  entityType: z.string().min(1).max(100),
  conditionField: z.string().max(100).optional(),
  conditionOperator: z.string().max(50).optional(),
  conditionValue: z.string().max(500).optional(),
  responseTimeMinutes: z.number().int().min(1),
  resolutionTimeMinutes: z.number().int().min(1).optional(),
  escalationUserId: z.string().uuid().optional(),
  escalationEmail: z.string().email().max(255).optional(),
  enabled: z.boolean().optional(),
})
export type CreateSlaConfig = z.infer<typeof CreateSlaConfigSchema>
