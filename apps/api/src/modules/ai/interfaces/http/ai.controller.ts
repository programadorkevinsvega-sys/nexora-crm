import { Controller, Get, Post, Param, Body, Headers, ParseUUIDPipe } from '@nestjs/common'
import { GenerateMessageDraftHandler } from '../../application/commands/ai.handlers'
import {
  GetDealWinProbabilityHandler,
  GetContactExecutiveSummaryHandler,
  GetChurnRiskPredictionHandler,
} from '../../application/queries/ai.handlers'
import { GenerateMessageDraftCommand } from '../../application/commands/ai.commands'
import {
  GetDealWinProbabilityQuery,
  GetContactExecutiveSummaryQuery,
  GetChurnRiskPredictionQuery,
} from '../../application/queries/ai.queries'
import { MessageChannel, MessageTone, MessageObjective } from '../../domain/entities/generated-draft.entity'

@Controller('ai')
export class AiController {
  constructor(
    private readonly winProbHandler: GetDealWinProbabilityHandler,
    private readonly draftHandler: GenerateMessageDraftHandler,
    private readonly summaryHandler: GetContactExecutiveSummaryHandler,
    private readonly churnHandler: GetChurnRiskPredictionHandler,
  ) {}

  @Get('deals/:dealId/win-probability')
  async getDealWinProbability(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.winProbHandler.execute(new GetDealWinProbabilityQuery(tenantId, dealId))
  }

  @Post('drafts/generate')
  async generateMessageDraft(
    @Body() dto: {
      channel: MessageChannel
      tone: MessageTone
      objective: MessageObjective
      contactId?: string
      dealId?: string
      customInstructions?: string
    },
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.draftHandler.execute(
      new GenerateMessageDraftCommand(
        tenantId,
        dto.channel,
        dto.tone,
        dto.objective,
        dto.contactId,
        dto.dealId,
        dto.customInstructions,
      ),
    )
  }

  @Get('contacts/:contactId/summary')
  async getContactExecutiveSummary(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.summaryHandler.execute(new GetContactExecutiveSummaryQuery(tenantId, contactId))
  }

  @Get('contacts/:contactId/churn-risk')
  async getChurnRiskPrediction(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.churnHandler.execute(new GetChurnRiskPredictionQuery(tenantId, contactId))
  }
}
