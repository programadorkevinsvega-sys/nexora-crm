import { LeadScoringBffController } from './lead-scoring.bff.controller'
import { LeadScoringBffService } from './lead-scoring.bff.service'
import { CreateScoringRuleSchema } from '@crm/contracts'

describe('LeadScoringBffController - REST Gateway Tests', () => {
  let controller: LeadScoringBffController
  let mockService: jest.Mocked<LeadScoringBffService>

  beforeEach(() => {
    mockService = {
      createRule: jest.fn().mockResolvedValue({ id: 'rule-1' }),
      listRules: jest.fn().mockResolvedValue([
        { id: 'rule-1', name: 'C-Level Boost', points: 30, category: 'DEMOGRAPHIC' },
      ]),
      toggleRule: jest.fn().mockResolvedValue({ id: 'rule-1', isActive: false }),
      getLeadScore: jest.fn().mockResolvedValue({
        id: 'ls-1',
        contactId: 'c-1',
        score: 85,
        temperature: 'HOT',
      }),
      recalculateScore: jest.fn().mockResolvedValue({
        id: 'ls-1',
        contactId: 'c-1',
        score: 90,
        temperature: 'HOT',
      }),
      adjustScore: jest.fn().mockResolvedValue({
        id: 'ls-1',
        contactId: 'c-1',
        score: 95,
        temperature: 'HOT',
      }),
      listTopLeads: jest.fn().mockResolvedValue([
        { id: 'ls-1', contactId: 'c-1', score: 95, temperature: 'HOT' },
      ]),
    } as unknown as jest.Mocked<LeadScoringBffService>

    controller = new LeadScoringBffController(mockService)
  })

  it('should call createRule on service when POST /api/scoring/rules is called', async () => {
    const payload = CreateScoringRuleSchema.parse({
      name: 'C-Level Boost', category: 'DEMOGRAPHIC', points: 30,
      condition: { field: 'contact.jobTitle', operator: 'CONTAINS', value: 'CEO' },
    })
    const result = await controller.createRule(payload, 'tenant-1')

    expect(mockService.createRule).toHaveBeenCalledWith(payload, 'tenant-1')
    expect(result.id).toBe('rule-1')
  })

  it('should call getLeadScore when GET /api/scoring/leads/:contactId is called', async () => {
    const result = await controller.getLeadScore('00000000-0000-0000-0000-000000000001', 'tenant-1')

    expect(mockService.getLeadScore).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001', 'tenant-1')
    expect(result?.score).toBe(85)
    expect(result?.temperature).toBe('HOT')
  })

  it('should call listTop when GET /api/scoring/top is called', async () => {
    const result = await controller.listTop('10', 'tenant-1')

    expect(mockService.listTopLeads).toHaveBeenCalledWith(10, 'tenant-1')
    expect(result).toHaveLength(1)
  })
})
