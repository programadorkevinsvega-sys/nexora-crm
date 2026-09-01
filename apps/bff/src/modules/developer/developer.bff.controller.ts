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
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiHeader } from '@nestjs/swagger'
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

@ApiTags('Desarrolladores & Webhooks (Developer)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/developer')
export class DeveloperBffController {
  constructor(private readonly service: DeveloperBffService) {}

  @Post('api-keys')
  @ApiOperation({ summary: 'Generar una nueva Clave de API' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'scopes'],
      properties: {
        name: { type: 'string', example: 'Integración ERP Facturación' },
        scopes: {
          type: 'array',
          items: { type: 'string' },
          example: ['contacts:read', 'contacts:write', 'deals:read', 'deals:write', 'quotes:read', 'quotes:write'],
        },
        expiresAt: { type: 'string', example: '2027-12-31T23:59:59Z' },
      },
    },
  })
  async createApiKey(
    @Body(createZodPipe(CreateApiKeySchema)) dto: CreateApiKey,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<CreatedApiKey> {
    return this.service.createApiKey(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('api-keys')
  @ApiOperation({ summary: 'Listar todas las Claves de API activas' })
  async listApiKeys(@Headers('X-Tenant-Id') tenantId?: string): Promise<ApiKey[]> {
    return this.service.listApiKeys(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Delete('api-keys/:id')
  @ApiOperation({ summary: 'Eliminar permanentemente una Clave de API' })
  @ApiParam({ name: 'id', description: 'UUID de la Clave de API' })
  async deleteApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: true }> {
    await this.service.deleteApiKey(id, tenantId || '00000000-0000-0000-0000-000000000001')
    return { success: true }
  }

  @Post('api-keys/:id/revoke')
  @ApiOperation({ summary: 'Revocar inmediatamente una Clave de API' })
  @ApiParam({ name: 'id', description: 'UUID de la Clave de API' })
  async revokeApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: true }> {
    await this.service.revokeApiKey(id, tenantId || '00000000-0000-0000-0000-000000000001')
    return { success: true }
  }

  @Post('webhooks')
  @ApiOperation({ summary: 'Registrar un nuevo Endpoint de Webhook saliente' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['url', 'events'],
      properties: {
        name: { type: 'string', example: 'Mi Servidor de Eventos' },
        url: { type: 'string', example: 'https://mi-servidor.com/api/webhook' },
        events: {
          type: 'array',
          items: { type: 'string' },
          example: ['contact.created', 'deal.won', 'contract.signed', 'ticket.created'],
        },
      },
    },
  })
  async createWebhook(
    @Body(createZodPipe(CreateWebhookEndpointSchema)) dto: CreateWebhookEndpoint,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WebhookEndpoint> {
    return this.service.createWebhookEndpoint(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'Listar Endpoints de Webhook registrados' })
  async listWebhooks(@Headers('X-Tenant-Id') tenantId?: string): Promise<WebhookEndpoint[]> {
    return this.service.listWebhookEndpoints(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Delete('webhooks/:id')
  @ApiOperation({ summary: 'Eliminar un Endpoint de Webhook' })
  @ApiParam({ name: 'id', description: 'UUID del Webhook' })
  async deleteWebhook(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: true }> {
    await this.service.deleteWebhookEndpoint(id, tenantId || '00000000-0000-0000-0000-000000000001')
    return { success: true }
  }

  @Get('webhooks/:id/deliveries')
  @ApiOperation({ summary: 'Historial de entregas y respuestas HTTP del Webhook' })
  @ApiParam({ name: 'id', description: 'UUID del Webhook' })
  async getDeliveryLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WebhookDeliveryLog[]> {
    return this.service.getDeliveryLogs(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('webhooks/dispatch')
  @ApiOperation({ summary: 'Disparar un evento de prueba hacia los Webhooks' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event: { type: 'string', example: 'contact.created' },
      },
    },
  })
  async dispatchTestEvent(
    @Body() dto: { event: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ dispatched: number }> {
    return this.service.dispatchTestEvent(dto.event || 'contact.created', tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
