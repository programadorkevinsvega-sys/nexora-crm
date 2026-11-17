import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateApiKeyHandler,
  RevokeApiKeyHandler,
  DeleteApiKeyHandler,
  CreateWebhookEndpointHandler,
  DeleteWebhookEndpointHandler,
  DispatchWebhookEventHandler,
} from '../../application/commands/developer.handlers'
import {
  ListApiKeysHandler,
  ValidateApiKeyHandler,
  ListWebhookEndpointsHandler,
  ListDeliveryLogsHandler,
} from '../../application/queries/developer.handlers'
import {
  CreateApiKeyCommand,
  RevokeApiKeyCommand,
  DeleteApiKeyCommand,
  CreateWebhookEndpointCommand,
  DeleteWebhookEndpointCommand,
  DispatchWebhookEventCommand,
} from '../../application/commands/developer.commands'
import {
  ListApiKeysQuery,
  ValidateApiKeyQuery,
  ListWebhookEndpointsQuery,
  ListDeliveryLogsQuery,
} from '../../application/queries/developer.queries'
import { ApiKeyScope } from '../../domain/entities/api-key.entity'
import { WebhookEvent } from '../../domain/entities/webhook-endpoint.entity'

@Controller()
export class DeveloperGrpcController {
  constructor(
    private readonly createKeyHandler: CreateApiKeyHandler,
    private readonly listKeysHandler: ListApiKeysHandler,
    private readonly revokeKeyHandler: RevokeApiKeyHandler,
    private readonly deleteKeyHandler: DeleteApiKeyHandler,
    private readonly validateKeyHandler: ValidateApiKeyHandler,
    private readonly createWebhookHandler: CreateWebhookEndpointHandler,
    private readonly listWebhooksHandler: ListWebhookEndpointsHandler,
    private readonly deleteWebhookHandler: DeleteWebhookEndpointHandler,
    private readonly listLogsHandler: ListDeliveryLogsHandler,
    private readonly dispatchWebhookHandler: DispatchWebhookEventHandler,
  ) {}

  @GrpcMethod('DeveloperService', 'CreateApiKey')
  async createApiKey(data: { tenantId: string; name: string; scopes: string[]; expiresAt?: string }) {
    const res = await this.createKeyHandler.execute(
      new CreateApiKeyCommand(
        data.tenantId,
        data.name,
        data.scopes as ApiKeyScope[],
        data.expiresAt ? new Date(data.expiresAt) : null,
      ),
    )
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('DeveloperService', 'GetApiKeys')
  async getApiKeys(data: { tenantId: string }) {
    const res = await this.listKeysHandler.execute(new ListApiKeysQuery(data.tenantId))
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('DeveloperService', 'RevokeApiKey')
  async revokeApiKey(data: { tenantId: string; id: string }) {
    await this.revokeKeyHandler.execute(new RevokeApiKeyCommand(data.tenantId, data.id))
    return { json: JSON.stringify({ success: true }) }
  }

  @GrpcMethod('DeveloperService', 'DeleteApiKey')
  async deleteApiKey(data: { tenantId: string; id: string }) {
    await this.deleteKeyHandler.execute(new DeleteApiKeyCommand(data.tenantId, data.id))
    return { json: JSON.stringify({ success: true }) }
  }


  @GrpcMethod('DeveloperService', 'ValidateApiKey')
  async validateApiKey(data: { rawKey: string }) {
    const res = await this.validateKeyHandler.execute(new ValidateApiKeyQuery(data.rawKey))
    if (res.valid) {
      return {
        valid: true,
        tenantId: res.tenantId,
        scopes: res.scopes,
        keyId: res.keyId,
      }
    }
    return {
      valid: false,
      tenantId: '',
      scopes: [],
      keyId: '',
    }
  }

  @GrpcMethod('DeveloperService', 'CreateWebhookEndpoint')
  async createWebhookEndpoint(data: { tenantId: string; name: string; url: string; events: string[] }) {
    const res = await this.createWebhookHandler.execute(
      new CreateWebhookEndpointCommand(
        data.tenantId,
        data.name,
        data.url,
        data.events as WebhookEvent[],
      ),
    )
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('DeveloperService', 'GetWebhookEndpoints')
  async getWebhookEndpoints(data: { tenantId: string }) {
    const res = await this.listWebhooksHandler.execute(new ListWebhookEndpointsQuery(data.tenantId))
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('DeveloperService', 'DeleteWebhookEndpoint')
  async deleteWebhookEndpoint(data: { tenantId: string; id: string }) {
    await this.deleteWebhookHandler.execute(new DeleteWebhookEndpointCommand(data.tenantId, data.id))
    return { json: JSON.stringify({ success: true }) }
  }

  @GrpcMethod('DeveloperService', 'GetDeliveryLogs')
  async getDeliveryLogs(data: { tenantId: string; endpointId: string }) {
    const res = await this.listLogsHandler.execute(
      new ListDeliveryLogsQuery(data.tenantId, data.endpointId),
    )
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('DeveloperService', 'DispatchWebhookEvent')
  async dispatchWebhookEvent(data: { tenantId: string; event: string; payloadJson: string }) {
    const payload = data.payloadJson ? JSON.parse(data.payloadJson) : {}
    const res = await this.dispatchWebhookHandler.execute(
      new DispatchWebhookEventCommand(data.tenantId, data.event, payload),
    )
    return { json: JSON.stringify(res) }
  }
}
