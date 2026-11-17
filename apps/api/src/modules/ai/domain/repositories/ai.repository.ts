import { DealWinPrediction } from '../entities/deal-win-prediction.entity'
import {
  GeneratedDraft,
  MessageChannel,
  MessageTone,
  MessageObjective,
} from '../entities/generated-draft.entity'
import { ContactExecutiveSummary } from '../entities/contact-summary.entity'
import { ChurnRiskPrediction } from '../entities/churn-prediction.entity'

export abstract class AiRepository {
  abstract predictDealWinProbability(tenantId: string, dealId: string): Promise<DealWinPrediction>
  abstract generateMessageDraft(
    tenantId: string,
    params: {
      contactId?: string
      dealId?: string
      channel: MessageChannel
      tone: MessageTone
      objective: MessageObjective
      customInstructions?: string
    },
  ): Promise<GeneratedDraft>
  abstract generateContactExecutiveSummary(
    tenantId: string,
    contactId: string,
  ): Promise<ContactExecutiveSummary>
  abstract predictChurnRisk(tenantId: string, contactId: string): Promise<ChurnRiskPrediction>
}
