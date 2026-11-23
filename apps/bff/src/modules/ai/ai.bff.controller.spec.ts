import { AiBffController } from './ai.bff.controller'
import { AiBffService } from './ai.bff.service'
import { RagService } from './rag/rag.service'
import type {
  DealWinProbability,
  GeneratedMessageDraft,
  ContactExecutiveSummary,
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
    } as unknown as jest.Mocked<AiBffService>

    const mockRagService = {
      searchKnowledgeBase: jest.fn().mockResolvedValue([]),
      generateGroundedReply: jest.fn().mockResolvedValue({ replyText: 'mock', retrievedChunks: [], sourceCount: 0 }),
    } as unknown as RagService

    controller = new AiBffController(mockService, mockRagService)
  })

  it('gets deal win probability from service', async () => {
    const probability: DealWinProbability = {
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
    mockService.getDealWinProbability.mockResolvedValue(probability)
    const result = await controller.getDealWinProbability(probability.dealId, 'tenant-1')
    expect(mockService.getDealWinProbability).toHaveBeenCalledWith(probability.dealId, 'tenant-1')
    expect(result.winProbabilityPercent).toBe(78)
  })

  it('generates a draft', async () => {
    const draft: GeneratedMessageDraft = {
      subject: 'Seguimiento', bodyText: 'Hola...', channel: 'EMAIL',
      tone: 'FORMAL', objective: 'FOLLOW_UP', tokensEstimated: 12,
    }
    mockService.generateMessageDraft.mockResolvedValue(draft)
    const result = await controller.generateMessageDraft(
      { channel: 'EMAIL', tone: 'FORMAL', objective: 'FOLLOW_UP' },
      'tenant-1',
    )
    expect(result.channel).toBe('EMAIL')
    expect(mockService.generateMessageDraft).toHaveBeenCalled()
  })

  it('gets contact executive summary', async () => {
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
    const result = await controller.getContactExecutiveSummary(summary.contactId, 'tenant-1')
    expect(mockService.getContactExecutiveSummary).toHaveBeenCalledWith(summary.contactId, 'tenant-1')
    expect(result.sentiment).toBe('POSITIVE')
  })
})