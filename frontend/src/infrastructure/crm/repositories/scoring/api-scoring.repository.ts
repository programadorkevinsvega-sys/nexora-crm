import { api, qs } from "../../api/api-client"
import type { LeadScoringRule, LeadScore } from "@/src/domain/crm/scoring/scoring.entity"

export const ApiScoringRepository = {
  async listRules(): Promise<LeadScoringRule[]> {
    const res = await api.get<any>("/api/scoring/rules")
    return Array.isArray(res) ? res : []
  },

  async createRule(data: {
    name: string
    category: string
    condition: any
    points: number
    description?: string
  }): Promise<{ id: string }> {
    return api.post<{ id: string }>("/api/scoring/rules", data)
  },

  async toggleRule(id: string): Promise<LeadScoringRule> {
    return api.post<LeadScoringRule>(`/api/scoring/rules/${id}/toggle`, {})
  },

  async getLeadScore(contactId: string): Promise<LeadScore | null> {
    return api.get<LeadScore | null>(`/api/scoring/leads/${contactId}`)
  },

  async recalculateScore(contactId: string, context: Record<string, unknown>): Promise<LeadScore> {
    return api.post<LeadScore>(`/api/scoring/leads/${contactId}/recalculate`, { context })
  },

  async adjustScore(contactId: string, points: number, reason: string): Promise<LeadScore> {
    return api.post<LeadScore>(`/api/scoring/leads/${contactId}/adjust`, { points, reason })
  },

  async listTopLeads(limit = 20): Promise<LeadScore[]> {
    const res = await api.get<any>(`/api/scoring/top${qs({ limit })}`)
    return Array.isArray(res) ? res : []
  },
}
