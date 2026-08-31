import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import {
  CreateApiKeyHandler,
  RevokeApiKeyHandler,
  CreateWebhookEndpointHandler,
  DeleteWebhookEndpointHandler,
  DispatchWebhookEventHandler,
} from '../../application/commands/developer.handlers'
import {
  ListApiKeysHandler,
  ListWebhookEndpointsHandler,
  ListDeliveryLogsHandler,
} from '../../application/queries/developer.handlers'
import {
  CreateApiKeyCommand,
  RevokeApiKeyCommand,
  CreateWebhookEndpointCommand,
  DeleteWebhookEndpointCommand,
  DispatchWebhookEventCommand,
} from '../../application/commands/developer.commands'
import {
  ListApiKeysQuery,
  ListWebhookEndpointsQuery,
  ListDeliveryLogsQuery,
} from '../../application/queries/developer.queries'
import { ApiKeyScope } from '../../domain/entities/api-key.entity'
import { WebhookEvent } from '../../domain/entities/webhook-endpoint.entity'

@Controller('developer')
export class DeveloperController {
  constructor(
    private readonly createKeyHandler: CreateApiKeyHandler,
    private readonly listKeysHandler: ListApiKeysHandler,
    private readonly revokeKeyHandler: RevokeApiKeyHandler,
    private readonly createWebhookHandler: CreateWebhookEndpointHandler,
    private readonly listWebhooksHandler: ListWebhookEndpointsHandler,
    private readonly deleteWebhookHandler: DeleteWebhookEndpointHandler,
    private readonly listLogsHandler: ListDeliveryLogsHandler,
    private readonly dispatchWebhookHandler: DispatchWebhookEventHandler,
  ) {}

  @Post('api-keys')
  async createApiKey(
    @Body() dto: { name: string; scopes: ApiKeyScope[]; expiresAt?: string },
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.createKeyHandler.execute(
      new CreateApiKeyCommand(
        tenantId,
        dto.name,
        dto.scopes,
        dto.expiresAt ? new Date(dto.expiresAt) : null,
      ),
    )
  }

  @Get('api-keys')
  async listApiKeys(
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.listKeysHandler.execute(new ListApiKeysQuery(tenantId))
  }

  @Delete('api-keys/:id')
  async revokeApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    await this.revokeKeyHandler.execute(new RevokeApiKeyCommand(tenantId, id))
    return { success: true }
  }

  @Post('webhooks')
  async createWebhook(
    @Body() dto: { name: string; url: string; events: WebhookEvent[] },
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.createWebhookHandler.execute(
      new CreateWebhookEndpointCommand(tenantId, dto.name, dto.url, dto.events),
    )
  }

  @Get('webhooks')
  async listWebhooks(
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.listWebhooksHandler.execute(new ListWebhookEndpointsQuery(tenantId))
  }

  @Delete('webhooks/:id')
  async deleteWebhook(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    await this.deleteWebhookHandler.execute(new DeleteWebhookEndpointCommand(tenantId, id))
    return { success: true }
  }

  @Get('webhooks/:id/deliveries')
  async listDeliveryLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.listLogsHandler.execute(new ListDeliveryLogsQuery(tenantId, id))
  }

  @Post('webhooks/dispatch')
  async dispatchWebhook(
    @Body() dto: { event: string; payload: Record<string, unknown> },
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.dispatchWebhookHandler.execute(
      new DispatchWebhookEventCommand(tenantId, dto.event, dto.payload),
    )
  }
}
