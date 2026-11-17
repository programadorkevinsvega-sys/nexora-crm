import { HealthScoreCalculatorHelper } from '../health-score-calculator.helper'

describe('HealthScoreCalculatorHelper', () => {
  it('should compute HEALTHY status for active customer with no open tickets', () => {
    const result = HealthScoreCalculatorHelper.calculate({
      interactionCount: 8,
      openTicketsCount: 0,
      hasActiveDealsOrContracts: true,
      daysSinceLastInteraction: 3,
    })

    expect(result.status).toBe('HEALTHY')
    expect(result.healthScore).toBeGreaterThanOrEqual(75)
    expect(result.churnProbability).toBeLessThanOrEqual(25)
  })

  it('should compute AT_RISK or CRITICAL status for dormant customer with many open tickets', () => {
    const result = HealthScoreCalculatorHelper.calculate({
      interactionCount: 1,
      openTicketsCount: 4,
      hasActiveDealsOrContracts: false,
      daysSinceLastInteraction: 90,
    })

    expect(['AT_RISK', 'CRITICAL']).toContain(result.status)
    expect(result.healthScore).toBeLessThan(50)
    expect(result.churnProbability).toBeGreaterThanOrEqual(50)
  })
})
