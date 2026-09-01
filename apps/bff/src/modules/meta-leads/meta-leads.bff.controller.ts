import {
  Controller, Get, Post, Body, Headers, Query,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiHeader } from '@nestjs/swagger'
import { MetaLeadsBffService } from './meta-leads.bff.service'
import type { MetaIntegration, MetaConfigUpdate, SimulateMetaLead } from '@crm/contracts'

@ApiTags('Integración Meta & Facebook Leads (Meta Leads)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/integrations/facebook')
export class MetaLeadsBffController {
  constructor(private readonly service: MetaLeadsBffService) {}

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado de conexión con Meta Graph API' })
  async getStatus(@Headers('X-Tenant-Id') tenantId?: string): Promise<MetaIntegration> {
    return this.service.getStatus(tenantId)
  }

  @Get('oauth-url')
  @ApiOperation({ summary: 'Generar URL de inicio de sesión con Facebook' })
  getOAuthUrl(
    @Query('redirectUri') redirectUri?: string,
    @Query('appId') appId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.service.getOAuthUrl(tenantId, redirectUri, appId)
  }

  @Post('oauth-callback')
  @ApiOperation({ summary: 'Intercambiar código de autorización OAuth por Access Token' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['code'],
      properties: {
        code: { type: 'string', example: 'AQD123456789...' },
      },
    },
  })
  async handleCallback(
    @Body('code') code: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<MetaIntegration> {
    return this.service.handleOAuthCallback(code, tenantId)
  }

  @Post('fetch-pages')
  @ApiOperation({ summary: 'Listar Páginas de Facebook y Cuentas Publicitarias del usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['accessToken'],
      properties: {
        accessToken: { type: 'string', example: 'EAA...' },
      },
    },
  })
  async fetchPages(
    @Body('accessToken') accessToken: string,
  ) {
    return this.service.fetchMetaPagesAndAccounts(accessToken)
  }

  @Post('connect')
  @ApiOperation({ summary: 'Conectar Página de Facebook seleccionada al CRM' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pageId: { type: 'string', example: '10987654321' },
        pageName: { type: 'string', example: 'Mi Página de Empresa' },
      },
    },
  })
  async connectAccount(
    @Body() dto: any,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<MetaIntegration> {
    return this.service.connectPage(dto, tenantId)
  }

  @Post('config')
  @ApiOperation({ summary: 'Configurar creación automática de Deals al capturar Leads' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        autoCreateDeal: { type: 'boolean', example: true },
        targetPipelineId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        targetStageId: { type: 'string', example: '00000000-0000-0000-0000-000000000002' },
      },
    },
  })
  async updateConfig(
    @Body() dto: MetaConfigUpdate,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<MetaIntegration> {
    return this.service.updateConfig(dto, tenantId)
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Desconectar integración de Meta' })
  async disconnect(@Headers('X-Tenant-Id') tenantId?: string) {
    await this.service.disconnect(tenantId)
    return { success: true }
  }

  @Get('logs')
  @ApiOperation({ summary: 'Historial de leads recibidos desde Meta Lead Ads' })
  async listLogs(@Headers('X-Tenant-Id') tenantId?: string) {
    return this.service.listLogs(tenantId)
  }
}
