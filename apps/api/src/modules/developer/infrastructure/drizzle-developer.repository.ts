import { Injectable } from '@nestjs/common'
import { DeveloperRepository } from '../domain/repositories/developer.repository'
import { ApiKey, ApiKeyScope } from '../domain/entities/api-key.entity'
import { WebhookEndpoint, WebhookEvent } from '../domain/entities/webhook-endpoint.entity'
import { WebhookDeliveryLog, DeliveryStatus } from '../domain/entities/webhook-delivery-log.entity'
import { DeveloperApiKeysDrizzleHelper } from './developer-api-keys.drizzle'
import { DeveloperWebhooksDrizzleHelper } from './developer-webhooks.drizzle'

@Injectable()
export class DrizzleDeveloperRepository extends DeveloperRepository {
  createApiKey(
    tenantId: string,
    name: string,
    scopes: ApiKeyScope[],
    rawKey: string,
    expiresAt?: Date | null,
  ): Promise<ApiKey> {
    return DeveloperApiKeysDrizzleHelper.createApiKey(tenantId, name, scopes, rawKey, expiresAt)
  }

  listApiKeys(tenantId: string): Promise<ApiKey[]> {
    return DeveloperApiKeysDrizzleHelper.listApiKeys(tenantId)
  }

  revokeApiKey(tenantId: string, id: string): Promise<void> {
    return DeveloperApiKeysDrizzleHelper.revokeApiKey(tenantId, id)
  }

  deleteApiKey(tenantId: string, id: string): Promise<void> {
    return DeveloperApiKeysDrizzleHelper.deleteApiKey(tenantId, id)
  }

  validateApiKey(
    rawKey: string,
  ): Promise<
    | { valid: true; tenantId: string; scopes: ApiKeyScope[]; keyId: string }
    | { valid: false }
  > {
    return DeveloperApiKeysDrizzleHelper.validateApiKey(rawKey)
  }

  markKeyUsed(keyId: string): Promise<void> {
    return DeveloperApiKeysDrizzleHelper.markKeyUsed(keyId)
  }

  createWebhookEndpoint(
    tenantId: string,
    name: string,
    url: string,
    events: WebhookEvent[],
  ): Promise<WebhookEndpoint> {
    return DeveloperWebhooksDrizzleHelper.createWebhookEndpoint(tenantId, name, url, events)
  }

  listWebhookEndpoints(tenantId: string): Promise<WebhookEndpoint[]> {
    return DeveloperWebhooksDrizzleHelper.listWebhookEndpoints(tenantId)
  }

  deleteWebhookEndpoint(tenantId: string, id: string): Promise<void> {
    return DeveloperWebhooksDrizzleHelper.deleteWebhookEndpoint(tenantId, id)
  }

  getEndpointsForEvent(
    tenantId: string,
    event: WebhookEvent,
  ): Promise<WebhookEndpoint[]> {
    return DeveloperWebhooksDrizzleHelper.getEndpointsForEvent(tenantId, event)
  }

  logDelivery(log: WebhookDeliveryLog): Promise<void> {
    return DeveloperWebhooksDrizzleHelper.logDelivery(log)
  }

  updateDeliveryLog(
    id: string,
    status: DeliveryStatus,
    responseStatus?: number,
    responseBody?: string,
    durationMs?: number,
  ): Promise<void> {
    return DeveloperWebhooksDrizzleHelper.updateDeliveryLog(id, status, responseStatus, responseBody, durationMs)
  }

  listDeliveryLogs(
    tenantId: string,
    endpointId: string,
  ): Promise<WebhookDeliveryLog[]> {
    return DeveloperWebhooksDrizzleHelper.listDeliveryLogs(tenantId, endpointId)
  }
}
