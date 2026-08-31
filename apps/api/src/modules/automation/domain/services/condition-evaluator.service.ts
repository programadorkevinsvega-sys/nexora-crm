export type ComparisonOperator = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN' | 'IS_EMPTY'

export interface ConditionRule {
  field: string
  operator: ComparisonOperator
  value?: unknown
}

export class ConditionEvaluator {
  static evaluate(condition: ConditionRule, context: Record<string, unknown>): boolean {
    const rawValue = this.extractFieldValue(condition.field, context)

    switch (condition.operator) {
      case 'EQUALS':
        return rawValue === condition.value || String(rawValue) === String(condition.value)

      case 'NOT_EQUALS':
        return rawValue !== condition.value && String(rawValue) !== String(condition.value)

      case 'GREATER_THAN':
        return Number(rawValue) > Number(condition.value)

      case 'LESS_THAN':
        return Number(rawValue) < Number(condition.value)

      case 'CONTAINS':
        if (typeof rawValue === 'string' && typeof condition.value === 'string') {
          return rawValue.toLowerCase().includes(condition.value.toLowerCase())
        }
        if (Array.isArray(rawValue)) {
          return rawValue.includes(condition.value)
        }
        return false

      case 'IN':
        if (Array.isArray(condition.value)) {
          return condition.value.includes(rawValue) || condition.value.map(String).includes(String(rawValue))
        }
        return false

      case 'IS_EMPTY':
        return rawValue === null || rawValue === undefined || rawValue === '' || (Array.isArray(rawValue) && rawValue.length === 0)

      default:
        return false
    }
  }

  static evaluateFilter(filter: Record<string, unknown> | null | undefined, context: Record<string, unknown>): boolean {
    if (!filter || Object.keys(filter).length === 0) return true

    for (const [key, expectedValue] of Object.entries(filter)) {
      const actualValue = this.extractFieldValue(key, context)
      if (actualValue === undefined || String(actualValue) !== String(expectedValue)) {
        return false
      }
    }
    return true
  }

  private static extractFieldValue(path: string, obj: Record<string, unknown>): unknown {
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
