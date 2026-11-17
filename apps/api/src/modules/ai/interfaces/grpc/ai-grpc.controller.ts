import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
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

@Controller()
export class AiGrpcController {
  constructor(
    private readonly winProbHandler: GetDealWinProbabilityHandler,
    private readonly draftHandler: GenerateMessageDraftHandler,
    private readonly summaryHandler: GetContactExecutiveSummaryHandler,
    private readonly churnHandler: GetChurnRiskPredictionHandler,
  ) {}

  @GrpcMethod('AiService', 'GetDealWinProbability')
  async getDealWinProbability(data: { tenantId: string; dealId: string }) {
    const res = await this.winProbHandler.execute(
      new GetDealWinProbabilityQuery(data.tenantId, data.dealId),
    )
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('AiService', 'GenerateMessageDraft')
  async generateMessageDraft(data: {
    tenantId: string
    channel: string
    tone: string
    objective: string
    contactId?: string
    dealId?: string
    customInstructions?: string
  }) {
    const res = await this.draftHandler.execute(
      new GenerateMessageDraftCommand(
        data.tenantId,
        data.channel as MessageChannel,
        data.tone as MessageTone,
        data.objective as MessageObjective,
        data.contactId,
        data.dealId,
        data.customInstructions,
      ),
    )
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('AiService', 'GetContactExecutiveSummary')
  async getContactExecutiveSummary(data: { tenantId: string; contactId: string }) {
    const res = await this.summaryHandler.execute(
      new GetContactExecutiveSummaryQuery(data.tenantId, data.contactId),
    )
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('AiService', 'GetChurnRiskPrediction')
  async getChurnRiskPrediction(data: { tenantId: string; contactId: string }) {
    const res = await this.churnHandler.execute(
      new GetChurnRiskPredictionQuery(data.tenantId, data.contactId),
    )
    return { json: JSON.stringify(res) }
  }
}
