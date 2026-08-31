import { LeadScoreCalculatorService } from '../../domain/services/lead-score-calculator.service'
import { LeadScoringRule } from '../../domain/entities/lead-scoring-rule.entity'

describe('LeadScoreCalculatorService', () => {
  const rules = [
    LeadScoringRule.create({
      tenantId: 'tenant-1',
      name: 'Executive Title',
      category: 'DEMOGRAPHIC',
      condition: { field: 'contact.jobTitle', operator: 'CONTAINS', value: 'Director' },
      points: 25,
    }),
    LeadScoringRule.create({
      tenantId: 'tenant-1',
      name: 'Enterprise Company',
      category: 'DEMOGRAPHIC',
      condition: { field: 'company.employees', operator: 'GREATER_THAN', value: 100 },
      points: 30,
    }),
    LeadScoringRule.create({
      tenantId: 'tenant-1',
      name: 'Target Country Colombia',
      category: 'DEMOGRAPHIC',
      condition: { field: 'contact.country', operator: 'EQUALS', value: 'Colombia' },
      points: 15,
    }),
    LeadScoringRule.create({
      tenantId: 'tenant-1',
      name: 'Inactive Rule',
      category: 'BEHAVIORAL',
      condition: { field: 'contact.leadSource', operator: 'EQUALS', value: 'WEB' },
      points: 10,
      isActive: false,
    }),
  ]

  it('should compute cumulative score for matching active rules only', () => {
    const context = {
      contact: {
        jobTitle: 'Director of Technology',
        country: 'Colombia',
        leadSource: 'WEB',
      },
      company: {
        employees: 250,
      },
    }

    const result = LeadScoreCalculatorService.calculateScore(rules, context)

    // Matches: Executive Title (25) + Enterprise Company (30) + Target Country (15) = 70 points
    // Inactive rule is skipped
    expect(result.totalPoints).toBe(70)
    expect(result.appliedRules).toHaveLength(3)
  })
})
