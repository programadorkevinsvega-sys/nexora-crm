import { z } from 'zod'

export const SupportTicketSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid().nullable(),
  subject: z.string().min(1).max(255),
  description: z.string().min(1),
  status: z.enum(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']).default('OPEN'),
  priority: z.string().default('MEDIUM'),
  assignedUserId: z.string().uuid().nullable(),
  slaId: z.string().uuid().nullable(),
  firstResponseAt: z.string().datetime().nullable(),
  slaBreachAt: z.string().datetime().nullable(),
  isEscalated: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type SupportTicket = z.infer<typeof SupportTicketSchema>

export const CreateTicketSchema = z.object({
  contactId: z.string().uuid().nullable().optional(),
  subject: z.string().min(1).max(255),
  description: z.string().min(1),
  priority: z.string().default('MEDIUM'),
})
export type CreateTicket = z.infer<typeof CreateTicketSchema>

export const UpdateTicketStatusSchema = z.object({
  status: z.enum(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']),
})
export type UpdateTicketStatus = z.infer<typeof UpdateTicketStatusSchema>
