import type { HealthStatus } from '@crm/contracts'

export interface CalculationInput {
  interactionCount: number
  openTicketsCount: number
  hasActiveDealsOrContracts: boolean
  daysSinceLastInteraction: number
}

export interface CalculationResult {
  healthScore: number
  status: HealthStatus
  engagementScore: number
  supportScore: number
  financialScore: number
  recencyScore: number
  churnProbability: number
  primaryRiskFactor: string
  recommendedAction: string
}

export class HealthScoreCalculatorHelper {
  static calculate(input: CalculationInput): CalculationResult {
    // 1. Engagement (0-30)
    let engagementScore = Math.min(30, Math.max(5, input.interactionCount * 4))

    // 2. Support Health (0-25)
    let supportScore = 25
    if (input.openTicketsCount > 2) {
      supportScore = 5
    } else if (input.openTicketsCount > 0) {
      supportScore = 15
    }

    // 3. Financial Health (0-25)
    const financialScore = input.hasActiveDealsOrContracts ? 25 : 12

    // 4. Recency (0-20)
    let recencyScore = 5
    if (input.daysSinceLastInteraction <= 7) {
      recencyScore = 20
    } else if (input.daysSinceLastInteraction <= 30) {
      recencyScore = 15
    } else if (input.daysSinceLastInteraction <= 60) {
      recencyScore = 10
    }

    const healthScore = Math.min(100, Math.max(0, engagementScore + supportScore + financialScore + recencyScore))
    const churnProbability = Math.max(0, Math.min(100, 100 - healthScore))

    let status: HealthStatus = 'HEALTHY'
    let primaryRiskFactor = 'Cliente con alta fidelidad y salud óptima.'
    let recommendedAction = 'Mantener cadencia periódica y explorar oportunidades de Up-Selling.'

    if (healthScore < 25) {
      status = 'CRITICAL'
      primaryRiskFactor = 'Inactividad prolongada y múltiples tickets de soporte no resueltos.'
      recommendedAction = 'Ejecutar llamada de rescate por Account Manager en las próximas 24 horas.'
    } else if (healthScore < 50) {
      status = 'AT_RISK'
      primaryRiskFactor = 'Baja interacción reciente y fricciones detectadas en soporte.'
      recommendedAction = 'Programar sesión de revisión de valor (QBR) y resolver tickets abiertos.'
    } else if (healthScore < 75) {
      status = 'NEUTRAL'
      primaryRiskFactor = 'Nivel de uso estable pero sin expansión reciente.'
      recommendedAction = 'Enviar encuesta CSAT y ofrecer capacitación en nuevas funcionalidades.'
    }

    return {
      healthScore,
      status,
      engagementScore,
      supportScore,
      financialScore,
      recencyScore,
      churnProbability,
      primaryRiskFactor,
      recommendedAction,
    }
  }
}
