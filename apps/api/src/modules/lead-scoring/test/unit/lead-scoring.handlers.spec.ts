import {
  CreateScoringRuleHandler,
  RecalculateLeadScoreHandler,
  AdjustLeadScoreHandler,
} from '../../application/commands/lead-scoring.handlers'
import {
  CreateScoringRuleCommand,
  RecalculateLeadScoreCommand,
  AdjustLeadScoreCommand,
} from '../../application/commands/lead-scoring.commands'
import { LeadScoringRule } from '../../domain/entities/lead-scoring-rule.entity'
import { LeadScore } from '../../domain/entities/lead-score.entity'
import { LeadScoringRuleRepository, LeadScoreRepository } from '../../domain/repositories/lead-scoring.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

describe('Lead Scoring Handlers', () => {
  let ruleRepo: jest.Mocked<LeadScoringRuleRepository>
  let scoreRepo: jest.Mocked<LeadScoreRepository>
  let outbox: jest.Mocked<OutboxService>

  beforeEach(() => {
    ruleRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      listActive: jest.fn(),
      listAll: jest.fn(),
      delete: jest.fn(),
    }

    scoreRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findByContactId: jest.fn(),
      listTopLeads: jest.fn(),
      listByTemperature: jest.fn(),
    }

    outbox = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as any
  })

  it('CreateScoringRuleHandler should persist a new scoring rule', async () => {
    const handler = new CreateScoringRuleHandler(ruleRepo)
    const result = await handler.execute(
      new CreateScoringRuleCommand(
        'tenant-1',
        'C-Level Boost',
        'DEMOGRAPHIC',
        { field: 'jobTitle', operator: 'CONTAINS', value: 'CEO' },
        30,
        'Adds 30 points to CEOs',
      ),
    )

    expect(result.id).toBeDefined()
    expect(ruleRepo.save).toHaveBeenCalledTimes(1)
  })

  it('RecalculateLeadScoreHandler should evaluate rules and save updated lead score', async () => {
    const rule = LeadScoringRule.create({
      tenantId: 'tenant-1',
      name: 'Requested Demo',
      category: 'BEHAVIORAL',
      condition: { field: 'requestedDemo', operator: 'EQUALS', value: true },
      points: 45,
    })
    ruleRepo.listActive.mockResolvedValue([rule])
    scoreRepo.findByContactId.mockResolvedValue(null) // New lead score initialized

    const handler = new RecalculateLeadScoreHandler(ruleRepo, scoreRepo, outbox)
    const updated = await handler.execute(
      new RecalculateLeadScoreCommand('tenant-1', 'contact-1', { requestedDemo: true }),
    )

    expect(updated.score).toBe(45)
    expect(updated.temperature).toBe('WARM')
    expect(scoreRepo.save).toHaveBeenCalledTimes(1)
    expect(outbox.publish).toHaveBeenCalled()
  })

  it('AdjustLeadScoreHandler should apply direct manual or action points to contact', async () => {
    const existing = LeadScore.create('tenant-1', 'contact-1', 75)
    scoreRepo.findByContactId.mockResolvedValue(existing)

    const handler = new AdjustLeadScoreHandler(scoreRepo, outbox)
    const updated = await handler.execute(
      new AdjustLeadScoreCommand('tenant-1', 'contact-1', 10, 'Attended webinar live'),
    )

    expect(updated.score).toBe(85)
    expect(updated.temperature).toBe('HOT')
    expect(scoreRepo.save).toHaveBeenCalledTimes(1)
  })
})
