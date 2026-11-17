import { Injectable } from '@nestjs/common'
import { DeveloperRepository } from '../../domain/repositories/developer.repository'
import { ApiKey, ApiKeyScope } from '../../domain/entities/api-key.entity'
import { WebhookEndpoint } from '../../domain/entities/webhook-endpoint.entity'
import { WebhookDeliveryLog } from '../../domain/entities/webhook-delivery-log.entity'
import {
  ListApiKeysQuery,
  ValidateApiKeyQuery,
  ListWebhookEndpointsQuery,
  ListDeliveryLogsQuery,
} from './developer.queries'

@Injectable()
export class ListApiKeysHandler {
  constructor(private readonly repo: DeveloperRepository) {}

  async execute(query: ListApiKeysQuery): Promise<ApiKey[]> {
    return this.repo.listApiKeys(query.tenantId)
  }
}

@Injectable()
export class ValidateApiKeyHandler {
  constructor(private readonly repo: DeveloperRepository) {}

  async execute(query: ValidateApiKeyQuery): Promise<
    | { valid: true; tenantId: string; scopes: ApiKeyScope[]; keyId: string }
    | { valid: false }
  > {
    const result = await this.repo.validateApiKey(query.rawKey)
    if (result.valid) {
      // Fire and forget updating lastUsedAt
      this.repo.markKeyUsed(result.keyId).catch(() => {})
    }
    return result
  }
}

@Injectable()
export class ListWebhookEndpointsHandler {
  constructor(private readonly repo: DeveloperRepository) {}

  async execute(query: ListWebhookEndpointsQuery): Promise<WebhookEndpoint[]> {
    return this.repo.listWebhookEndpoints(query.tenantId)
  }
}

@Injectable()
export class ListDeliveryLogsHandler {
  constructor(private readonly repo: DeveloperRepository) {}

  async execute(query: ListDeliveryLogsQuery): Promise<WebhookDeliveryLog[]> {
    return this.repo.listDeliveryLogs(query.tenantId, query.endpointId)
  }
}
