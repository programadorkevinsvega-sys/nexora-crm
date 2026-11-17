import { z } from 'zod'

export const TaskSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  dealId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  taskType: z.enum(['CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'TODO']).default('TODO'),
  dueDate: z.string().datetime(),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().datetime().nullable().optional(),
  reminderAt: z.string().datetime().nullable().optional(),
  assignedUserId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Task = z.infer<typeof TaskSchema>

export const CreateTaskSchema = z.object({
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  dealId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM').optional(),
  taskType: z.enum(['CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'TODO']).default('TODO').optional(),
  dueDate: z.string().datetime().or(z.string()),
  reminderAt: z.string().datetime().or(z.string()).optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
})
export type CreateTask = z.infer<typeof CreateTaskSchema>

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  taskType: z.enum(['CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'TODO']).optional(),
  dueDate: z.string().datetime().optional(),
  isCompleted: z.boolean().optional(),
  completedAt: z.string().datetime().optional(),
  reminderAt: z.string().datetime().optional(),
}).partial()
export type UpdateTask = z.infer<typeof UpdateTaskSchema>
