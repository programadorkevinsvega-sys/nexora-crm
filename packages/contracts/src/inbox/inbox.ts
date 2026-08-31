import { z } from 'zod'

export const InboxChannelSchema = z.enum(['WHATSAPP', 'EMAIL', 'SMS', 'WEBCHAT'])
export type InboxChannel = z.infer<typeof InboxChannelSchema>

export const InboxMessageStatusSchema = z.enum(['QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED'])
export type InboxMessageStatus = z.infer<typeof InboxMessageStatusSchema>

export const InboxConversationStatusSchema = z.enum(['OPEN', 'PENDING', 'RESOLVED', 'SNOOZED'])
export type InboxConversationStatus = z.infer<typeof InboxConversationStatusSchema>

export const InboxMessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  channel: InboxChannelSchema,
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  senderName: z.string(),
  senderIdentifier: z.string(),
  recipientIdentifier: z.string(),
  bodyText: z.string(),
  bodyHtml: z.string().nullable().optional(),
  status: InboxMessageStatusSchema.default('DELIVERED'),
  sentAt: z.string(),
})
export type InboxMessage = z.infer<typeof InboxMessageSchema>

export const InboxConversationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  channel: InboxChannelSchema,
  contactId: z.string().uuid().nullable().optional(),
  contactName: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  leadScore: z.number().int().default(0),
  leadTemperature: z.enum(['COLD', 'WARM', 'HOT']).default('COLD'),
  subject: z.string(),
  status: InboxConversationStatusSchema.default('OPEN'),
  lastMessageText: z.string().nullable().optional(),
  lastMessageAt: z.string(),
  unreadCount: z.number().int().default(0),
  assignedUserId: z.string().uuid().nullable().optional(),
  messages: z.array(InboxMessageSchema).default([]),
})
export type InboxConversation = z.infer<typeof InboxConversationSchema>

export const SendInboxMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  channel: InboxChannelSchema,
  recipientIdentifier: z.string().min(1),
  subject: z.string().optional(),
  bodyText: z.string().min(1),
})
export type SendInboxMessage = z.infer<typeof SendInboxMessageSchema>
