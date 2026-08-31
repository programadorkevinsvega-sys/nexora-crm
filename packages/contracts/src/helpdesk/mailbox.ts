import { z } from 'zod'

export const HelpdeskMailboxSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  emailAddress: z.string().email(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type HelpdeskMailbox = z.infer<typeof HelpdeskMailboxSchema>

export const CreateMailboxSchema = z.object({
  name: z.string().min(1).max(255),
  emailAddress: z.string().email(),
  isActive: z.boolean().optional(),
})
export type CreateMailbox = z.infer<typeof CreateMailboxSchema>
