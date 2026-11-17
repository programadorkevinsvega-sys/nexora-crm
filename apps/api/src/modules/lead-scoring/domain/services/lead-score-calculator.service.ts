import { LeadScoringRule } from '../entities/lead-scoring-rule.entity'
import { ScoringCondition } from '@crm/contracts'

export class LeadScoreCalculatorService {
  static evaluateCondition(condition: ScoringCondition, context: Record<string, unknown>): boolean {
    const value = this.extractValue(condition.field, context)

    switch (condition.operator) {
      case 'EQUALS':
        return value === condition.value || String(value).toLowerCase() === String(condition.value).toLowerCase()

      case 'NOT_EQUALS':
        return value !== condition.value && String(value).toLowerCase() !== String(condition.value).toLowerCase()

      case 'GREATER_THAN':
        return Number(value) > Number(condition.value)

      case 'LESS_THAN':
        return Number(value) < Number(condition.value)

      case 'CONTAINS':
        if (typeof value === 'string' && typeof condition.value === 'string') {
          return value.toLowerCase().includes(condition.value.toLowerCase())
        }
        if (Array.isArray(value)) {
          return value.includes(condition.value)
        }
        return false

      case 'IN':
        if (Array.isArray(condition.value)) {
          return condition.value.includes(value) || condition.value.map(String).includes(String(value))
        }
        return false

      case 'IS_EMPTY':
        return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)

      default:
        return false
    }
  }

  static calculateScore(rules: LeadScoringRule[], context: Record<string, unknown>): {
    totalPoints: number
    appliedRules: { ruleId: string; name: string; points: number }[]
  } {
    let totalPoints = 0
    const appliedRules: { ruleId: string; name: string; points: number }[] = []

    for (const rule of rules) {
      if (!rule.isActive) continue

      if (this.evaluateCondition(rule.condition, context)) {
        totalPoints += rule.points
        appliedRules.push({
          ruleId: rule.id,
          name: rule.name,
          points: rule.points,
        })
      }
    }

    return { totalPoints: Math.max(0, totalPoints), appliedRules }
  }

  private static extractValue(path: string, obj: Record<string, unknown>): unknown {
    if (!obj || typeof obj !== 'object') return undefined
    const parts = path.split('.')
    let current: unknown = obj
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') return undefined
      current = (current as Record<string, unknown>)[part]
    }
    return current
  }
}
