import { Controller, Get, Post, Param, Body, Headers, ParseUUIDPipe } from '@nestjs/common'
import { AiBffService } from './ai.bff.service'
import { RagService } from './rag/rag.service'
import { GenerateMessageDraftSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import type {
  DealWinProbability,
  GenerateMessageDraft,
  GeneratedMessageDraft,
  ContactExecutiveSummary,
  ChurnRiskPrediction,
} from '@crm/contracts'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

@Controller('api/ai')
export class AiBffController {
  constructor(
    private readonly service: AiBffService,
    private readonly ragService: RagService,
  ) {}

  @Get('deals/:dealId/win-probability')
  async getDealWinProbability(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<DealWinProbability> {
    return this.service.getDealWinProbability(dealId, tenantId || DEFAULT_TENANT_ID)
  }

  @Post('drafts/generate')
  async generateMessageDraft(
    @Body(createZodPipe(GenerateMessageDraftSchema)) dto: GenerateMessageDraft,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<GeneratedMessageDraft> {
    return this.service.generateMessageDraft(dto, tenantId || DEFAULT_TENANT_ID)
  }

  @Get('contacts/:contactId/summary')
  async getContactExecutiveSummary(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<ContactExecutiveSummary> {
    return this.service.getContactExecutiveSummary(contactId, tenantId || DEFAULT_TENANT_ID)
  }

  @Get('contacts/:contactId/churn-risk')
  async getChurnRiskPrediction(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<ChurnRiskPrediction> {
    return this.service.getChurnRiskPrediction(contactId, tenantId || DEFAULT_TENANT_ID)
  }

  @Post('rag/search')
  async searchKnowledge(
    @Body() dto: { query: string; topK?: number },
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.ragService.searchKnowledgeBase(tenantId || DEFAULT_TENANT_ID, dto.query, dto.topK || 3)
  }

  @Post('rag/grounded-reply')
  async generateGroundedReply(
    @Body() dto: { query: string; authorName?: string; platform?: string; customPrompt?: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.ragService.generateGroundedReply(tenantId || DEFAULT_TENANT_ID, dto)
  }
}
