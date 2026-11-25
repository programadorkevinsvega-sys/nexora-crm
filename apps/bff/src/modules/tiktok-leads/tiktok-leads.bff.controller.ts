import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiHeader } from '@nestjs/swagger'
import { TiktokLeadsBffService, TiktokIntegrationState } from './tiktok-leads.bff.service'

interface TiktokConfigRequest {
  accessToken?: string
  pixelId?: string
  advertiserAccessToken?: string
  advertiserId?: string
}

@ApiTags('Integración TikTok Leads Ads (TikTok Leads)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/integrations/tiktok')
export class TiktokLeadsBffController {
  private readonly logger = new Logger(TiktokLeadsBffController.name)
  constructor(private readonly service: TiktokLeadsBffService) {}

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado de conexión con TikTok Lead Generation' })
  getStatus(@Headers('X-Tenant-Id') tenantId?: string): TiktokIntegrationState {
    return this.service.getStatus(tenantId)
  }

  @Get('webhook-url')
  @ApiOperation({ summary: 'Obtener URL del webhook para configurar en TikTok Ads Manager' })
  getWebhookUrl(@Headers('X-Tenant-Id') tenantId?: string) {
    return this.service.getWebhookUrl(tenantId)
  }

  @Post('config')
  @ApiOperation({ summary: 'Guardar configuración de asignación de Leads de TikTok' })
  @ApiBody({ schema: { type: 'object', properties: {
    accessToken: { type: 'string' }, pixelId: { type: 'string' },
    advertiserAccessToken: { type: 'string' }, advertiserId: { type: 'string' },
  } } })
  saveConfig(@Body() dto: TiktokConfigRequest, @Headers('X-Tenant-Id') tenantId?: string): Promise<TiktokIntegrationState> {
    return this.service.saveConfig(dto, tenantId)
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook receptor de leads instantáneos desde TikTok' })
  @HttpCode(HttpStatus.OK)
  receiveWebhook(@Body() body: unknown, @Headers('X-Tenant-Id') tenantId?: string) {
    return this.service.processWebhookLead(body, tenantId)
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Desconectar integración de TikTok' })
  @HttpCode(HttpStatus.OK)
  disconnect(@Headers('X-Tenant-Id') tenantId?: string): { success: boolean } {
    return this.service.disconnect(tenantId)
  }
}