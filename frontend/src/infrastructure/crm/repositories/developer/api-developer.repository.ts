import { api } from '../../api/api-client'

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

export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  isActive: boolean
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export interface CreatedApiKey extends ApiKey {
  rawKey: string
}

export interface CreateApiKey {
  name: string
  scopes: ApiKeyScope[]
  expiresAt?: string
}

export interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  createdAt: string
}

export interface CreateWebhookEndpoint {
  name: string
  url: string
  events: WebhookEvent[]
}

export interface WebhookDeliveryLog {
  id: string
  event: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'RETRYING'
  responseStatus: number | null
  attempt: number
  durationMs: number | null
  deliveredAt: string | null
  createdAt: string
}

const BASE = '/api/developer'

export const ApiDeveloperRepository = {
  async listApiKeys(): Promise<ApiKey[]> {
    return api.get<ApiKey[]>(`${BASE}/api-keys`)
  },

  async createApiKey(dto: CreateApiKey): Promise<CreatedApiKey> {
    return api.post<CreatedApiKey>(`${BASE}/api-keys`, dto)
  },

  async revokeApiKey(id: string): Promise<void> {
    return api.post(`${BASE}/api-keys/${id}/revoke`, {})
  },

  async deleteApiKey(id: string): Promise<void> {
    return api.delete(`${BASE}/api-keys/${id}`)
  },


  async listWebhookEndpoints(): Promise<WebhookEndpoint[]> {
    return api.get<WebhookEndpoint[]>(`${BASE}/webhooks`)
  },

  async createWebhookEndpoint(dto: CreateWebhookEndpoint): Promise<WebhookEndpoint> {
    return api.post<WebhookEndpoint>(`${BASE}/webhooks`, dto)
  },

  async deleteWebhookEndpoint(id: string): Promise<void> {
    return api.delete(`${BASE}/webhooks/${id}`)
  },

  async getDeliveryLogs(endpointId: string): Promise<WebhookDeliveryLog[]> {
    return api.get<WebhookDeliveryLog[]>(`${BASE}/webhooks/${endpointId}/deliveries`)
  },

  async dispatchTestEvent(event: string): Promise<void> {
    return api.post(`${BASE}/webhooks/dispatch`, { event })
  },
}
