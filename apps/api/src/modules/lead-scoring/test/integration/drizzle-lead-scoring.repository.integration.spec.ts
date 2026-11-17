import { DrizzleLeadScoringRuleRepository, DrizzleLeadScoreRepository } from '../../infrastructure/drizzle-lead-scoring.repository'
import { LeadScoringRule } from '../../domain/entities/lead-scoring-rule.entity'
import { LeadScore } from '../../domain/entities/lead-score.entity'
import * as dbModule from '@crm/database'

describe('Drizzle Lead Scoring Repositories - Persistence Integration Tests', () => {
  let ruleRepo: DrizzleLeadScoringRuleRepository
  let scoreRepo: DrizzleLeadScoreRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    ruleRepo = new DrizzleLeadScoringRuleRepository()
    scoreRepo = new DrizzleLeadScoreRepository()
  })

  it('should save a new lead scoring rule via insert', async () => {
    mockDb.limit.mockResolvedValueOnce([]) // findById not found

    const rule = LeadScoringRule.create({
      tenantId: 'tenant-1',
      name: 'High Budget Deal',
      category: 'BEHAVIORAL',
      condition: { field: 'deal.amount', operator: 'GREATER_THAN', value: 10000 },
      points: 20,
    })

    await ruleRepo.save(rule)

    expect(mockDb.insert).toHaveBeenCalledTimes(1)
  })

  it('should save a lead score entity via insert', async () => {
    mockDb.limit.mockResolvedValueOnce([]) // findByContactId not found

    const score = LeadScore.create('tenant-1', 'contact-100', 85)

    await scoreRepo.save(score)

    expect(mockDb.insert).toHaveBeenCalledTimes(1)
  })
})
