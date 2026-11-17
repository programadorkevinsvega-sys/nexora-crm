import { ApiKey, ApiKeyScope } from '../entities/api-key.entity'
import { WebhookEndpoint, WebhookEvent } from '../entities/webhook-endpoint.entity'
import { WebhookDeliveryLog, DeliveryStatus } from '../entities/webhook-delivery-log.entity'

export abstract class DeveloperRepository {
  abstract createApiKey(
    tenantId: string,
    name: string,
    scopes: ApiKeyScope[],
    rawKey: string,
    expiresAt?: Date | null,
  ): Promise<ApiKey>

  abstract listApiKeys(tenantId: string): Promise<ApiKey[]>

  abstract revokeApiKey(tenantId: string, id: string): Promise<void>

  abstract deleteApiKey(tenantId: string, id: string): Promise<void>

  abstract validateApiKey(
    rawKey: string,
  ): Promise<
    | { valid: true; tenantId: string; scopes: ApiKeyScope[]; keyId: string }
    | { valid: false }
  >

  abstract markKeyUsed(keyId: string): Promise<void>

  abstract createWebhookEndpoint(
    tenantId: string,
    name: string,
    url: string,
    events: WebhookEvent[],
  ): Promise<WebhookEndpoint>

  abstract listWebhookEndpoints(tenantId: string): Promise<WebhookEndpoint[]>

  abstract deleteWebhookEndpoint(tenantId: string, id: string): Promise<void>

  abstract getEndpointsForEvent(tenantId: string, event: WebhookEvent): Promise<WebhookEndpoint[]>

  abstract logDelivery(log: WebhookDeliveryLog): Promise<void>

  abstract updateDeliveryLog(
    id: string,
    status: DeliveryStatus,
    responseStatus?: number,
    responseBody?: string,
    durationMs?: number,
  ): Promise<void>

  abstract listDeliveryLogs(tenantId: string, endpointId: string): Promise<WebhookDeliveryLog[]>
}
