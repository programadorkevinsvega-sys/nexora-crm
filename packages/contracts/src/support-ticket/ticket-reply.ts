import { z } from 'zod'

export const TicketReplySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  ticketId: z.string().uuid(),
  authorType: z.enum(['CUSTOMER', 'AGENT', 'SYSTEM']),
  authorId: z.string().uuid(),
  message: z.string().min(1),
  isInternalNote: z.boolean().default(false),
  createdAt: z.string().datetime(),
})
export type TicketReply = z.infer<typeof TicketReplySchema>

export const CreateReplySchema = z.object({
  message: z.string().min(1),
  isInternalNote: z.boolean().default(false),
})
export type CreateReply = z.infer<typeof CreateReplySchema>
