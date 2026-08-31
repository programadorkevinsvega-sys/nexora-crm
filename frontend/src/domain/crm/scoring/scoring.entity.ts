export type LeadTemperature = 'COLD' | 'WARM' | 'HOT'
export type ScoringRuleCategory = 'DEMOGRAPHIC' | 'BEHAVIORAL' | 'ENGAGEMENT'

export interface ScoringCondition {
  field: string
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN' | 'IS_EMPTY'
  value?: unknown
}

export interface LeadScoringRule {
  id: string
  tenantId: string
  name: string
  description?: string | null
  category: ScoringRuleCategory
  condition: ScoringCondition
  points: number
  decayDays?: number | null
  decayPoints?: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ScoreAdjustmentLog {
  ruleId?: string
  reason: string
  points: number
  appliedAt: string
}

export interface LeadScore {
  id: string
  tenantId: string
  contactId: string
  score: number
  temperature: LeadTemperature
  lastActivityAt: string
  history: ScoreAdjustmentLog[]
  createdAt: string
  updatedAt: string
}
