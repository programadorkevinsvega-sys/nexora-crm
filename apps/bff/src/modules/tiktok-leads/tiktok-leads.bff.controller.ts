import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common'
import { TiktokLeadsBffService, TiktokIntegrationState } from './tiktok-leads.bff.service'

@Controller('api/integrations/tiktok')
export class TiktokLeadsBffController {
  private readonly logger = new Logger(TiktokLeadsBffController.name)
  constructor(private readonly service: TiktokLeadsBffService) {}

  @Get('status')
  getStatus(@Headers('X-Tenant-Id') tenantId?: string): TiktokIntegrationState {
    return this.service.getStatus(tenantId)
  }

  @Get('webhook-url')
  getWebhookUrl(@Headers('X-Tenant-Id') tenantId?: string) {
    return this.service.getWebhookUrl(tenantId)
  }

  @Post('config')
  saveConfig(@Body() dto: any, @Headers('X-Tenant-Id') tenantId?: string): Promise<TiktokIntegrationState> {
    return this.service.saveConfig(dto, tenantId)
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  receiveWebhook(@Body() body: any, @Headers('X-Tenant-Id') tenantId?: string) {
    return this.service.processWebhookLead(body, tenantId)
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.OK)
  disconnect(@Headers('X-Tenant-Id') tenantId?: string): { success: boolean } {
    return this.service.disconnect(tenantId)
  }
}
