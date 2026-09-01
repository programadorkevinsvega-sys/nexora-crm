import { Injectable } from '@nestjs/common'
import { AiRepository } from '../domain/repositories/ai.repository'
import { DealWinPrediction } from '../domain/entities/deal-win-prediction.entity'
import {
  GeneratedDraft,
  MessageChannel,
  MessageTone,
  MessageObjective,
} from '../domain/entities/generated-draft.entity'
import { ContactExecutiveSummary } from '../domain/entities/contact-summary.entity'
import { ChurnRiskPrediction } from '../domain/entities/churn-prediction.entity'
import { AiDealDraftsDrizzleHelper } from './ai-deal-drafts.drizzle'
import { AiContactChurnDrizzleHelper } from './ai-contact-churn.drizzle'

@Injectable()
export class DrizzleAiRepository extends AiRepository {
  predictDealWinProbability(tenantId: string, dealId: string): Promise<DealWinPrediction> {
    return AiDealDraftsDrizzleHelper.predictDealWinProbability(tenantId, dealId)
  }

  generateMessageDraft(
    tenantId: string,
    params: {
      contactId?: string
      dealId?: string
      channel: MessageChannel
      tone: MessageTone
      objective: MessageObjective
      customInstructions?: string
    },
  ): Promise<GeneratedDraft> {
    return AiDealDraftsDrizzleHelper.generateMessageDraft(tenantId, params)
  }

  generateContactExecutiveSummary(tenantId: string, contactId: string): Promise<ContactExecutiveSummary> {
    return AiContactChurnDrizzleHelper.generateContactExecutiveSummary(tenantId, contactId)
  }

  predictChurnRisk(tenantId: string, contactId: string): Promise<ChurnRiskPrediction> {
    return AiContactChurnDrizzleHelper.predictChurnRisk(tenantId, contactId)
  }
}
