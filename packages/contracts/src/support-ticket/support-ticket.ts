import { z } from 'zod'

export const SupportTicketSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  subject: z.string().min(1).max(255),
  description: z.string().min(1),
  status: z.enum(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']).default('OPEN'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  channel: z.enum(['EMAIL', 'WHATSAPP', 'PORTAL', 'PHONE']).default('PORTAL').optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  slaId: z.string().uuid().nullable().optional(),
  slaPolicyId: z.string().uuid().nullable().optional(),
  firstResponseAt: z.string().datetime().nullable().optional(),
  slaBreachAt: z.string().datetime().nullable().optional(),
  resolvedAt: z.string().datetime().nullable().optional(),
  closedAt: z.string().datetime().nullable().optional(),
  isEscalated: z.boolean().default(false),
  escalationLevel: z.number().int().min(1).max(3).default(1).optional(),
  csatScore: z.number().int().min(1).max(5).nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type SupportTicket = z.infer<typeof SupportTicketSchema>

export const CreateTicketSchema = z.object({
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  subject: z.string().min(1).max(255),
  description: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM').optional(),
  channel: z.enum(['EMAIL', 'WHATSAPP', 'PORTAL', 'PHONE']).default('PORTAL').optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
})
export type CreateTicket = z.infer<typeof CreateTicketSchema>

export const UpdateTicketStatusSchema = z.object({
  status: z.enum(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']),
  csatScore: z.number().int().min(1).max(5).optional(),
})
export type UpdateTicketStatus = z.infer<typeof UpdateTicketStatusSchema>
