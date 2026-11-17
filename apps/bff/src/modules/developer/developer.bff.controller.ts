import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger'
import { DeveloperBffService } from './developer.bff.service'
import { AdminOnlyGuard } from '../../common/guards/admin-only.guard'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
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
@ApiBearerAuth()
@UseGuards(AdminOnlyGuard)
@Controller('api/developer')
export class DeveloperBffController {
  constructor(private readonly service: DeveloperBffService) {}

  @Post('api-keys')
  @ApiOperation({ summary: 'Generar una nueva Clave de API (Solo Administradores)' })
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
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CreatedApiKey> {
    return this.service.createApiKey(dto, user.tenantId)
  }

  @Get('api-keys')
  @ApiOperation({ summary: 'Listar todas las Claves de API activas (Solo Administradores)' })
  async listApiKeys(@CurrentUser() user: AuthenticatedUser): Promise<ApiKey[]> {
    return this.service.listApiKeys(user.tenantId)
  }

  @Delete('api-keys/:id')
  @ApiOperation({ summary: 'Eliminar permanentemente una Clave de API' })
  @ApiParam({ name: 'id', description: 'UUID de la Clave de API' })
  async deleteApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: true }> {
    await this.service.deleteApiKey(id, user.tenantId)
    return { success: true }
  }

  @Post('api-keys/:id/revoke')
  @ApiOperation({ summary: 'Revocar inmediatamente una Clave de API' })
  @ApiParam({ name: 'id', description: 'UUID de la Clave de API' })
  async revokeApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: true }> {
    await this.service.revokeApiKey(id, user.tenantId)
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
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WebhookEndpoint> {
    return this.service.createWebhookEndpoint(dto, user.tenantId)
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'Listar Endpoints de Webhook registrados' })
  async listWebhooks(@CurrentUser() user: AuthenticatedUser): Promise<WebhookEndpoint[]> {
    return this.service.listWebhookEndpoints(user.tenantId)
  }

  @Delete('webhooks/:id')
  @ApiOperation({ summary: 'Eliminar un Endpoint de Webhook' })
  @ApiParam({ name: 'id', description: 'UUID del Webhook' })
  async deleteWebhook(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: true }> {
    await this.service.deleteWebhookEndpoint(id, user.tenantId)
    return { success: true }
  }

  @Get('webhooks/:id/deliveries')
  @ApiOperation({ summary: 'Historial de entregas y respuestas HTTP del Webhook' })
  @ApiParam({ name: 'id', description: 'UUID del Webhook' })
  async getDeliveryLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WebhookDeliveryLog[]> {
    return this.service.getDeliveryLogs(id, user.tenantId)
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
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ dispatched: number }> {
    return this.service.dispatchTestEvent(dto.event || 'contact.created', user.tenantId)
  }
}
