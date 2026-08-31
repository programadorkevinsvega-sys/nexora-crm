import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  ApiKey,
  CreatedApiKey,
  CreateApiKey,
  WebhookEndpoint,
  CreateWebhookEndpoint,
  WebhookDeliveryLog,
} from '@crm/contracts'

@Injectable()
export class DeveloperBffService {
  constructor(
    private readonly grpc: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async createApiKey(dto: CreateApiKey, tenantId: string): Promise<CreatedApiKey> {
    return this.grpc.createApiKey({
      tenantId,
      name: dto.name,
      scopes: dto.scopes,
      expiresAt: dto.expiresAt || undefined,
    })
  }

  async listApiKeys(tenantId: string): Promise<ApiKey[]> {
    return this.grpc.listApiKeys(tenantId)
  }

  async revokeApiKey(id: string, tenantId: string): Promise<void> {
    await this.grpc.revokeApiKey(tenantId, id)
  }

  async deleteApiKey(id: string, tenantId: string): Promise<void> {
    await this.grpc.deleteApiKey(tenantId, id)
  }


  async createWebhookEndpoint(
    dto: CreateWebhookEndpoint,
    tenantId: string,
  ): Promise<WebhookEndpoint> {
    return this.grpc.createWebhookEndpoint({
      tenantId,
      name: dto.name,
      url: dto.url,
      events: dto.events,
    })
  }

  async listWebhookEndpoints(tenantId: string): Promise<WebhookEndpoint[]> {
    return this.grpc.listWebhookEndpoints(tenantId)
  }

  async deleteWebhookEndpoint(id: string, tenantId: string): Promise<void> {
    await this.grpc.deleteWebhookEndpoint(tenantId, id)
  }

  async getDeliveryLogs(
    endpointId: string,
    tenantId: string,
  ): Promise<WebhookDeliveryLog[]> {
    return this.grpc.getDeliveryLogs(tenantId, endpointId)
  }

  async dispatchTestEvent(
    event: string,
    tenantId: string,
  ): Promise<{ dispatched: number }> {
    return this.grpc.dispatchWebhookEvent({
      tenantId,
      event,
      payloadJson: JSON.stringify({
        test: true,
        message: 'Manual test webhook event dispatched from Developer Portal',
        timestamp: new Date().toISOString(),
      }),
    })
  }
}
