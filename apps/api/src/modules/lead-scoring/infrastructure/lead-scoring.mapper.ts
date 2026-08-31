import { LeadScore } from '../domain/entities/lead-score.entity'
import { LeadScoringRule } from '../domain/entities/lead-scoring-rule.entity'
import { LeadTemperature, ScoringRuleCategory, ScoringCondition, ScoreAdjustmentLog } from '@crm/contracts'

export class LeadScoringMapper {
  static ruleToDomain(row: any): LeadScoringRule {
    return new LeadScoringRule(
      row.id,
      row.tenantId,
      row.name,
      row.description ?? null,
      row.category as ScoringRuleCategory,
      row.condition as ScoringCondition,
      row.points,
      row.decayDays ?? null,
      row.decayPoints ?? null,
      row.isActive,
      new Date(row.createdAt),
      new Date(row.updatedAt),
    )
  }

  static scoreToDomain(row: any): LeadScore {
    return new LeadScore(
      row.id,
      row.tenantId,
      row.contactId,
      row.score,
      row.temperature as LeadTemperature,
      new Date(row.lastActivityAt),
      (row.history as ScoreAdjustmentLog[]) ?? [],
      new Date(row.createdAt),
      new Date(row.updatedAt),
    )
  }

  static ruleToResponse(rule: LeadScoringRule) {
    return {
      id: rule.id,
      tenantId: rule.tenantId,
      name: rule.name,
      description: rule.description,
      category: rule.category,
      condition: rule.condition,
      points: rule.points,
      decayDays: rule.decayDays,
      decayPoints: rule.decayPoints,
      isActive: rule.isActive,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    }
  }

  static scoreToResponse(score: LeadScore) {
    return {
      id: score.id,
      tenantId: score.tenantId,
      contactId: score.contactId,
      score: score.score,
      temperature: score.temperature,
      lastActivityAt: score.lastActivityAt.toISOString(),
      history: score.history,
      createdAt: score.createdAt.toISOString(),
      updatedAt: score.updatedAt.toISOString(),
    }
  }
}
