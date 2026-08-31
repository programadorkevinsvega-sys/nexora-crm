import { z } from 'zod'

export const HelpdeskThreadSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  conversationId: z.string().uuid(),
  threadType: z.string().max(50),
  bodyHtml: z.string().nullable(),
  bodyText: z.string().nullable(),
  createdByUserId: z.string().uuid().nullable(),
  createdByCustomerId: z.string().uuid().nullable(),
  isDraft: z.boolean().default(false),
  messageIdHeader: z.string().max(255).nullable(),
  toAddresses: z.string().max(500).nullable(),
  ccAddresses: z.string().max(500).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type HelpdeskThread = z.infer<typeof HelpdeskThreadSchema>

export const AddThreadSchema = z.object({
  threadType: z.string().max(50),
  bodyHtml: z.string().optional(),
  bodyText: z.string().optional(),
  createdByUserId: z.string().uuid().optional(),
  createdByCustomerId: z.string().uuid().optional(),
  isDraft: z.boolean().optional(),
  messageIdHeader: z.string().max(255).optional(),
  toAddresses: z.string().max(500).optional(),
  ccAddresses: z.string().max(500).optional(),
})
export type AddThread = z.infer<typeof AddThreadSchema>
