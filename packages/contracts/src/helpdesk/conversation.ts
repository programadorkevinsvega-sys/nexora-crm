import { z } from 'zod'

export const HelpdeskConversationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  mailboxId: z.string().uuid(),
  ticketNumber: z.number().nullable(),
  subject: z.string().min(1).max(255),
  customerEmail: z.string().email(),
  customerId: z.string().uuid().nullable(),
  assigneeUserId: z.string().uuid().nullable(),
  status: z.enum(['OPEN', 'PENDING', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']).default('OPEN'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  sourceChannel: z.string().max(50).nullable(),
  previewText: z.string().max(500).nullable(),
  hasAttachments: z.boolean().default(false),
  lastReplyAt: z.string().datetime().nullable(),
  lastReplyFrom: z.string().max(50).nullable(),
  closedAt: z.string().datetime().nullable(),
  estimatedHours: z.number().nullable(),
  workedHours: z.number().nullable(),
  dueDate: z.string().datetime().nullable(),
  firstResponseAt: z.string().datetime().nullable(),
  resolvedAt: z.string().datetime().nullable(),
  isInternal: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type HelpdeskConversation = z.infer<typeof HelpdeskConversationSchema>

export const CreateConversationSchema = z.object({
  mailboxId: z.string().uuid(),
  subject: z.string().min(1).max(255),
  customerEmail: z.string().email(),
  customerId: z.string().uuid().optional(),
  assigneeUserId: z.string().uuid().optional(),
  status: z.enum(['OPEN', 'PENDING', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  sourceChannel: z.string().max(50).optional(),
  previewText: z.string().max(500).optional(),
  estimatedHours: z.number().optional(),
  dueDate: z.string().optional(),
  isInternal: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
})
export type CreateConversation = z.infer<typeof CreateConversationSchema>

export const ConversationFilterSchema = z.object({
  mailboxId: z.string().uuid().optional(),
  status: z.string().optional(),
  assigneeUserId: z.string().uuid().optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type ConversationFilter = z.infer<typeof ConversationFilterSchema>
