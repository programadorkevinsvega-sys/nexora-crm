import { z } from 'zod'

export const TaskSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid().nullable(),
  companyId: z.string().uuid().nullable(),
  dealId: z.string().uuid().nullable(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  dueDate: z.string().datetime(),
  isCompleted: z.boolean().default(false),
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
  dueDate: z.string().datetime().or(z.string()),
  assignedUserId: z.string().uuid().nullable().optional(),
})
export type CreateTask = z.infer<typeof CreateTaskSchema>

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  isCompleted: z.boolean().optional(),
}).partial()
export type UpdateTask = z.infer<typeof UpdateTaskSchema>
