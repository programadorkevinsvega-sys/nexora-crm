import { z } from 'zod'

export const LifeEventSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid(),
  eventType: z.string().max(100),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  happenedAt: z.string().datetime().nullable(),
  isYearlyRecurring: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type LifeEvent = z.infer<typeof LifeEventSchema>

export const CreateLifeEventSchema = z.object({
  contactId: z.string().uuid(),
  eventType: z.string().max(100),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  happenedAt: z.string().optional(),
  isYearlyRecurring: z.boolean().optional(),
})
export type CreateLifeEvent = z.infer<typeof CreateLifeEventSchema>
