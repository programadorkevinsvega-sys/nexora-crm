import { AiBffController } from './ai.bff.controller'
import { AiBffService } from './ai.bff.service'
import type {
  DealWinProbability,
  GeneratedMessageDraft,
  ContactExecutiveSummary,
  ChurnRiskPrediction,
} from '@crm/contracts'

describe('AiBffController', () => {
  let controller: AiBffController
  let mockService: jest.Mocked<AiBffService>

  beforeEach(() => {
    mockService = {
      getDealWinProbability: jest.fn(),
      generateMessageDraft: jest.fn(),
      getContactExecutiveSummary: jest.fn(),
      getChurnRiskPrediction: jest.fn(),
    } as any

    controller = new AiBffController(mockService)
  })

  it('should get deal win probability on GET /api/ai/deals/:dealId/win-probability', async () => {
    const prob: DealWinProbability = {
      dealId: '00000000-0000-0000-0000-000000000001',
      dealName: 'Acme SaaS Deal',
      dealAmount: 15000,
      winProbabilityPercent: 78,
      dealHealth: 'EXCELLENT',
      positiveFactors: ['Cotización aceptada'],
      riskFactors: [],
      recommendedNextActions: ['Enviar contrato'],
      predictedCloseDate: '2026-09-15',
      calculatedAt: new Date().toISOString(),
    }
    mockService.getDealWinProbability.mockResolvedValue(prob)

    const res = await controller.getDealWinProbability(prob.dealId, 'tenant-1')

    expect(mockService.getDealWinProbability).toHaveBeenCalledWith(prob.dealId, 'tenant-1')
    expect(res.winProbabilityPercent).toBe(78)
  })

  it('should generate draft on POST /api/ai/drafts/generate', async () => {
    const draft: GeneratedMessageDraft = {
      subject: 'Seguimiento',
      bodyText: 'Hola...',
      channel: 'EMAIL',
      tone: 'FORMAL',
      objective: 'FOLLOW_UP',
      tokensEstimated: 12,
    }
    mockService.generateMessageDraft.mockResolvedValue(draft)

    const res = await controller.generateMessageDraft(
      { channel: 'EMAIL', tone: 'FORMAL', objective: 'FOLLOW_UP' },
      'tenant-1',
    )

    expect(res.channel).toBe('EMAIL')
    expect(mockService.generateMessageDraft).toHaveBeenCalled()
  })

  it('should get contact executive summary on GET /api/ai/contacts/:contactId/summary', async () => {
    const summary: ContactExecutiveSummary = {
      contactId: '00000000-0000-0000-0000-000000000001',
      contactName: 'Carlos',
      summary: 'Resumen...',
      sentiment: 'POSITIVE',
      keyPainPoints: [],
      recommendedStrategy: 'Upsell',
      generatedAt: new Date().toISOString(),
    }
    mockService.getContactExecutiveSummary.mockResolvedValue(summary)

    const res = await controller.getContactExecutiveSummary(summary.contactId, 'tenant-1')

    expect(mockService.getContactExecutiveSummary).toHaveBeenCalledWith(summary.contactId, 'tenant-1')
    expect(res.sentiment).toBe('POSITIVE')
  })
})
