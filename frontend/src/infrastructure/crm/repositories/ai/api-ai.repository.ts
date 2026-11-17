import { api } from "../../api/api-client"
import type {
  DealWinProbability,
  GenerateMessageDraft,
  GeneratedMessageDraft,
  ContactExecutiveSummary,
  ChurnRiskPrediction,
} from "@crm/contracts"

export const ApiAiRepository = {
  async getDealWinProbability(dealId: string): Promise<DealWinProbability> {
    return api.get<DealWinProbability>(`/api/ai/deals/${dealId}/win-probability`)
  },

  async generateMessageDraft(data: GenerateMessageDraft): Promise<GeneratedMessageDraft> {
    return api.post<GeneratedMessageDraft>("/api/ai/drafts/generate", data)
  },

  async getContactExecutiveSummary(contactId: string): Promise<ContactExecutiveSummary> {
    return api.get<ContactExecutiveSummary>(`/api/ai/contacts/${contactId}/summary`)
  },

  async getChurnRiskPrediction(contactId: string): Promise<ChurnRiskPrediction> {
    return api.get<ChurnRiskPrediction>(`/api/ai/contacts/${contactId}/churn-risk`)
  },
}
