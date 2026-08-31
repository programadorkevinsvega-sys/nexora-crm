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
import { DeveloperBffService } from './developer.bff.service'
import {
  CreateApiKeySchema,
  CreateWebhookEndpointSchema,
} from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import type {
  ApiKey,
  CreatedApiKey,
  CreateApiKey,
  WebhookEndpoint,
  CreateWebhookEndpoint,
  WebhookDeliveryLog,
} from '@crm/contracts'

@Controller('api/developer')
export class DeveloperBffController {
  constructor(private readonly service: DeveloperBffService) {}

  @Post('api-keys')
  async createApiKey(
    @Body(createZodPipe(CreateApiKeySchema)) dto: CreateApiKey,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<CreatedApiKey> {
    return this.service.createApiKey(
      dto,
      tenantId || '00000000-0000-0000-0000-000000000001',
    )
  }

  @Get('api-keys')
  async listApiKeys(
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<ApiKey[]> {
    return this.service.listApiKeys(
      tenantId || '00000000-0000-0000-0000-000000000001',
    )
  }

  @Delete('api-keys/:id')
  async deleteApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: true }> {
    await this.service.deleteApiKey(
      id,
      tenantId || '00000000-0000-0000-0000-000000000001',
    )
    return { success: true }
  }

  @Post('api-keys/:id/revoke')
  async revokeApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: true }> {
    await this.service.revokeApiKey(
      id,
      tenantId || '00000000-0000-0000-0000-000000000001',
    )
    return { success: true }
  }


  @Post('webhooks')
  async createWebhook(
    @Body(createZodPipe(CreateWebhookEndpointSchema))
    dto: CreateWebhookEndpoint,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WebhookEndpoint> {
    return this.service.createWebhookEndpoint(
      dto,
      tenantId || '00000000-0000-0000-0000-000000000001',
    )
  }

  @Get('webhooks')
  async listWebhooks(
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WebhookEndpoint[]> {
    return this.service.listWebhookEndpoints(
      tenantId || '00000000-0000-0000-0000-000000000001',
    )
  }

  @Delete('webhooks/:id')
  async deleteWebhook(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: true }> {
    await this.service.deleteWebhookEndpoint(
      id,
      tenantId || '00000000-0000-0000-0000-000000000001',
    )
    return { success: true }
  }

  @Get('webhooks/:id/deliveries')
  async getDeliveryLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WebhookDeliveryLog[]> {
    return this.service.getDeliveryLogs(
      id,
      tenantId || '00000000-0000-0000-0000-000000000001',
    )
  }

  @Post('webhooks/dispatch')
  async dispatchTestEvent(
    @Body() dto: { event: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ dispatched: number }> {
    return this.service.dispatchTestEvent(
      dto.event || 'contact.created',
      tenantId || '00000000-0000-0000-0000-000000000001',
    )
  }
}
