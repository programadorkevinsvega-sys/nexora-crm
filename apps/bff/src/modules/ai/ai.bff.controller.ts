import { Controller, Get, Post, Param, Body, Headers, ParseUUIDPipe } from '@nestjs/common'
import { AiBffService } from './ai.bff.service'
import { GenerateMessageDraftSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import type {
  DealWinProbability,
  GenerateMessageDraft,
  GeneratedMessageDraft,
  ContactExecutiveSummary,
  ChurnRiskPrediction,
} from '@crm/contracts'

@Controller('api/ai')
export class AiBffController {
  constructor(private readonly service: AiBffService) {}

  @Get('deals/:dealId/win-probability')
  async getDealWinProbability(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<DealWinProbability> {
    return this.service.getDealWinProbability(dealId, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('drafts/generate')
  async generateMessageDraft(
    @Body(createZodPipe(GenerateMessageDraftSchema)) dto: GenerateMessageDraft,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<GeneratedMessageDraft> {
    return this.service.generateMessageDraft(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('contacts/:contactId/summary')
  async getContactExecutiveSummary(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<ContactExecutiveSummary> {
    return this.service.getContactExecutiveSummary(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('contacts/:contactId/churn-risk')
  async getChurnRiskPrediction(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<ChurnRiskPrediction> {
    return this.service.getChurnRiskPrediction(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
