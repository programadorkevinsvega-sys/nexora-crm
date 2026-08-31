import {
  Controller, Get, Post, Body, Headers, Query,
} from '@nestjs/common'
import { MetaLeadsBffService } from './meta-leads.bff.service'
import type { MetaIntegration, MetaConfigUpdate, SimulateMetaLead } from '@crm/contracts'

@Controller('api/integrations/facebook')
export class MetaLeadsBffController {
  constructor(private readonly service: MetaLeadsBffService) {}

  @Get('status')
  async getStatus(@Headers('X-Tenant-Id') tenantId?: string): Promise<MetaIntegration> {
    return this.service.getStatus(tenantId)
  }

  @Get('oauth-url')
  getOAuthUrl(
    @Query('redirectUri') redirectUri?: string,
    @Query('appId') appId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.service.getOAuthUrl(tenantId, redirectUri, appId)
  }

  @Post('oauth-callback')
  async handleCallback(
    @Body('code') code: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<MetaIntegration> {
    return this.service.handleOAuthCallback(code, tenantId)
  }

  @Post('fetch-pages')
  async fetchPages(
    @Body('accessToken') accessToken: string,
  ) {
    return this.service.fetchMetaPagesAndAccounts(accessToken)
  }

  @Post('connect')
  async connectAccount(
    @Body() dto: any,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<MetaIntegration> {
    return this.service.connectPage(dto, tenantId)
  }

  @Post('config')
  async updateConfig(
    @Body() dto: MetaConfigUpdate,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<MetaIntegration> {
    return this.service.updateConfig(dto, tenantId)
  }


  @Post('sync-forms')
  async syncForms(@Headers('X-Tenant-Id') tenantId?: string) {
    return this.service.syncForms(tenantId)
  }

  @Post('disconnect')
  async disconnect(@Headers('X-Tenant-Id') tenantId?: string) {
    await this.service.disconnect(tenantId)
    return { success: true }
  }

  @Get('logs')
  async listLogs(@Headers('X-Tenant-Id') tenantId?: string) {
    return this.service.listLogs(tenantId)
  }

  @Post('simulate')
  async simulateLead(
    @Body() dto: SimulateMetaLead,
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.service.simulateLead(dto, tenantId)
  }
}
