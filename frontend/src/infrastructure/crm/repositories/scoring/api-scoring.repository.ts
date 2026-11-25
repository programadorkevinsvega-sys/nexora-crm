import { api, qs } from "../../api/api-client"
import type { LeadScoringRule, LeadScore, ScoreAdjustmentLog } from "@/src/domain/crm/scoring/scoring.entity"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isScoreAdjustmentLog(value: unknown): value is ScoreAdjustmentLog {
  return isRecord(value)
    && typeof value.reason === 'string'
    && typeof value.points === 'number'
    && typeof value.appliedAt === 'string'
    && (value.ruleId === undefined || typeof value.ruleId === 'string')
}

function isLeadScore(value: unknown): value is LeadScore {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.tenantId === 'string'
    && typeof value.contactId === 'string'
    && typeof value.score === 'number'
    && (value.temperature === 'COLD' || value.temperature === 'WARM' || value.temperature === 'HOT')
    && typeof value.lastActivityAt === 'string'
    && Array.isArray(value.history)
    && value.history.every(isScoreAdjustmentLog)
    && typeof value.createdAt === 'string'
    && typeof value.updatedAt === 'string'
}

function isLeadScoringRule(value: unknown): value is LeadScoringRule {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.tenantId === 'string'
    && typeof value.name === 'string'
    && (value.category === 'DEMOGRAPHIC' || value.category === 'BEHAVIORAL' || value.category === 'ENGAGEMENT')
    && isRecord(value.condition)
    && typeof value.condition.field === 'string'
    && typeof value.condition.operator === 'string'
    && typeof value.points === 'number'
    && typeof value.isActive === 'boolean'
    && typeof value.createdAt === 'string'
    && typeof value.updatedAt === 'string'
}

function arrayFromResponse(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (isRecord(value) && Array.isArray(value.data)) return value.data
  return []
}

export const ApiScoringRepository = {
  async listRules(): Promise<LeadScoringRule[]> {
    const response = await api.get<unknown>('/api/scoring/rules')
    return arrayFromResponse(response).filter(isLeadScoringRule)
  },

  async createRule(data: {
    name: string
    category: LeadScoringRule['category']
    condition: LeadScoringRule['condition']
    points: number
    description?: string
  }): Promise<{ id: string }> {
    return api.post<{ id: string }>('/api/scoring/rules', data)
  },

  async toggleRule(id: string): Promise<LeadScoringRule> {
    return api.post<LeadScoringRule>(`/api/scoring/rules/${id}/toggle`, {})
  },

  async getLeadScore(contactId: string): Promise<LeadScore | null> {
    const response = await api.get<unknown>(`/api/scoring/leads/${contactId}`)
    return isLeadScore(response) ? response : null
  },

  async recalculateScore(contactId: string, context: Record<string, unknown>): Promise<LeadScore> {
    const response = await api.post<unknown>(`/api/scoring/leads/${contactId}/recalculate`, { context })
    if (!isLeadScore(response)) throw new TypeError('Invalid lead score response')
    return response
  },

  async adjustScore(contactId: string, points: number, reason: string): Promise<LeadScore> {
    const response = await api.post<unknown>(`/api/scoring/leads/${contactId}/adjust`, { points, reason })
    if (!isLeadScore(response)) throw new TypeError('Invalid lead score response')
    return response
  },

  async listTopLeads(limit = 20): Promise<LeadScore[]> {
    const response = await api.get<unknown>(`/api/scoring/top${qs({ limit })}`)
    return arrayFromResponse(response).filter(isLeadScore)
  },
}
