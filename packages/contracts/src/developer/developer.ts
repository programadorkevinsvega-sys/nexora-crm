import { z } from 'zod'

// API Key scopes
export const API_KEY_SCOPES = [
  'contacts:read',
  'contacts:write',
  'companies:read',
  'companies:write',
  'deals:read',
  'deals:write',
  'interactions:read',
  'interactions:write',
  'tickets:read',
  'tickets:write',
  'quotes:read',
  'quotes:write',
  'contracts:read',
  'contracts:write',
  'campaigns:read',
  'campaigns:write',
  'scoring:read',
  'scoring:write',
  'kb:read',
  'ai:read',
  'ai:write',
  'webhooks:manage',
] as const
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number]

export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum(API_KEY_SCOPES)).min(1),
  expiresAt: z.string().optional().nullable(),
})
export type CreateApiKey = z.infer<typeof CreateApiKeySchema>

export const ApiKeySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  keyPrefix: z.string(), // e.g. "nex_live_xxxx"
  scopes: z.array(z.string()),
  isActive: z.boolean(),
  lastUsedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
})
export type ApiKey = z.infer<typeof ApiKeySchema>

// Shown only once on creation
export const CreatedApiKeySchema = ApiKeySchema.extend({
  rawKey: z.string(), // nex_live_<64 random hex chars>
})
export type CreatedApiKey = z.infer<typeof CreatedApiKeySchema>

// Webhook events enum
export const WEBHOOK_EVENTS = [
  'contact.created',
  'contact.updated',
  'deal.stage_changed',
  'deal.won',
  'deal.lost',
  'quote.accepted',
  'quote.rejected',
  'contract.signed',
  'ticket.created',
  'ticket.resolved',
  'payment.received',
] as const
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number]

export const CreateWebhookEndpointSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1),
})
export type CreateWebhookEndpoint = z.infer<typeof CreateWebhookEndpointSchema>

export const WebhookEndpointSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string(),
  events: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string(),
})
export type WebhookEndpoint = z.infer<typeof WebhookEndpointSchema>

export const WebhookDeliveryLogSchema = z.object({
  id: z.string().uuid(),
  event: z.string(),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'RETRYING']),
  responseStatus: z.number().nullable(),
  attempt: z.number(),
  durationMs: z.number().nullable(),
  deliveredAt: z.string().nullable(),
  createdAt: z.string(),
})
export type WebhookDeliveryLog = z.infer<typeof WebhookDeliveryLogSchema>
