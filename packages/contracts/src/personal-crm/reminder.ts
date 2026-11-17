import { z } from 'zod'

export const ReminderSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  frequencyType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']).default('CUSTOM'),
  frequencyInterval: z.number().int().default(1),
  nextDueDate: z.string().datetime().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Reminder = z.infer<typeof ReminderSchema>

export const CreateReminderSchema = z.object({
  contactId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  frequencyType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']).optional(),
  frequencyInterval: z.number().int().optional(),
  nextDueDate: z.string().optional(),
  isActive: z.boolean().optional(),
})
export type CreateReminder = z.infer<typeof CreateReminderSchema>
