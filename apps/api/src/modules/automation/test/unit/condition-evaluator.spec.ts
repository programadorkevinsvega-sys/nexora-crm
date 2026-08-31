import { ConditionEvaluator } from '../../domain/services/condition-evaluator.service'

describe('ConditionEvaluator Domain Service', () => {
  const context = {
    contact: {
      name: 'Carlos Ruiz',
      leadScore: 92,
      country: 'Colombia',
      tags: ['VIP', 'Enterprise'],
    },
    deal: {
      amount: 15000000,
      stage: 'PROPOSAL',
    },
  }

  it('should evaluate EQUALS and NOT_EQUALS operators', () => {
    expect(
      ConditionEvaluator.evaluate(
        { field: 'contact.country', operator: 'EQUALS', value: 'Colombia' },
        context,
      ),
    ).toBe(true)

    expect(
      ConditionEvaluator.evaluate(
        { field: 'contact.country', operator: 'NOT_EQUALS', value: 'Mexico' },
        context,
      ),
    ).toBe(true)
  })

  it('should evaluate GREATER_THAN and LESS_THAN numeric comparisons', () => {
    expect(
      ConditionEvaluator.evaluate(
        { field: 'contact.leadScore', operator: 'GREATER_THAN', value: 80 },
        context,
      ),
    ).toBe(true)

    expect(
      ConditionEvaluator.evaluate(
        { field: 'deal.amount', operator: 'LESS_THAN', value: 20000000 },
        context,
      ),
    ).toBe(true)
  })

  it('should evaluate CONTAINS and IN operators for strings and arrays', () => {
    expect(
      ConditionEvaluator.evaluate(
        { field: 'contact.name', operator: 'CONTAINS', value: 'Ruiz' },
        context,
      ),
    ).toBe(true)

    expect(
      ConditionEvaluator.evaluate(
        { field: 'contact.tags', operator: 'CONTAINS', value: 'VIP' },
        context,
      ),
    ).toBe(true)

    expect(
      ConditionEvaluator.evaluate(
        { field: 'deal.stage', operator: 'IN', value: ['PROPOSAL', 'NEGOTIATION'] },
        context,
      ),
    ).toBe(true)
  })

  it('should evaluate trigger filters with evaluateFilter', () => {
    expect(
      ConditionEvaluator.evaluateFilter(
        { 'contact.country': 'Colombia', 'deal.stage': 'PROPOSAL' },
        context,
      ),
    ).toBe(true)

    expect(
      ConditionEvaluator.evaluateFilter(
        { 'contact.country': 'Chile' },
        context,
      ),
    ).toBe(false)
  })
})
