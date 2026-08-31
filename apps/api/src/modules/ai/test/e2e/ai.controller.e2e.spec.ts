import { Test, TestingModule } from '@nestjs/testing'
import { AiController } from '../../interfaces/http/ai.controller'
import { GetDealWinProbabilityHandler } from '../../application/queries/ai.handlers'
import { GenerateMessageDraftHandler } from '../../application/commands/ai.handlers'
import { GetContactExecutiveSummaryHandler } from '../../application/queries/ai.handlers'
import { GetChurnRiskPredictionHandler } from '../../application/queries/ai.handlers'
import { DealWinPrediction } from '../../domain/entities/deal-win-prediction.entity'
import { GeneratedDraft } from '../../domain/entities/generated-draft.entity'
import { ContactExecutiveSummary } from '../../domain/entities/contact-summary.entity'
import { ChurnRiskPrediction } from '../../domain/entities/churn-prediction.entity'

// ─────────────────────────────────────────────────
// E2E: AiController — NestJS TestingModule approach
// Tests the full HTTP layer against mocked handlers
// ─────────────────────────────────────────────────
describe('AiController (e2e - NestJS TestingModule)', () => {
  let controller: AiController

  const TENANT = '00000000-0000-0000-0000-000000000001'
  const DEAL_ID = '00000000-0000-0000-0000-000000000002'
  const CONTACT_ID = '00000000-0000-0000-0000-000000000003'

  const mockWinProbHandler = { execute: jest.fn() }
  const mockDraftHandler = { execute: jest.fn() }
  const mockSummaryHandler = { execute: jest.fn() }
  const mockChurnHandler = { execute: jest.fn() }

  // DealWinPrediction: id, tenantId, dealId, dealName, dealAmount,
  //   winProbabilityPercent, dealHealth, positiveFactors, riskFactors, recommendedNextActions,
  //   predictedCloseDate, calculatedAt
  const fakePrediction = new DealWinPrediction(
    'pred-1', TENANT, DEAL_ID, 'Acme Enterprise Deal', 48000,
    87, 'EXCELLENT',
    ['Cotización CPQ aprobada (+35%)', 'Alto engagement omnicanal (+15%)'],
    [],
    ['Enviar contrato digital para firma'],
    '2026-09-30', new Date(),
  )

  // GeneratedDraft: id, tenantId, contactId, dealId, channel, tone, objective, subject, bodyText, tokensEstimated, createdAt
  const fakeDraft = new GeneratedDraft(
    'draft-1', TENANT, CONTACT_ID, DEAL_ID,
    'EMAIL', 'PERSUASIVE', 'FOLLOW_UP',
    'Seguimiento Propuesta Comercial — Acme Enterprise',
    'Estimado Juan,\n\nQuería hacer seguimiento a nuestra propuesta...',
    80, new Date(),
  )

  // ContactExecutiveSummary: contactId, contactName, summary, sentiment, keyPainPoints, recommendedStrategy, generatedAt
  const fakeSummary = new ContactExecutiveSummary(
    CONTACT_ID, 'Juan García',
    'El cliente tiene una relación positiva de 18 meses con la empresa.',
    'POSITIVE',
    ['Costo de implementación inicial'],
    'Presentar plan de onboarding premium y ofrecer descuento por volumen',
    new Date(),
  )

  // ChurnRiskPrediction: contactId, contactName, churnRiskPercent, churnRiskLevel, riskIndicators, preventiveActions, calculatedAt
  const fakeChurn = new ChurnRiskPrediction(
    CONTACT_ID, 'Juan García', 22, 'LOW',
    [],
    ['Enviar NPS trimestral', 'Agendar revisión de uso del producto'],
    new Date(),
  )

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        { provide: GetDealWinProbabilityHandler, useValue: mockWinProbHandler },
        { provide: GenerateMessageDraftHandler, useValue: mockDraftHandler },
        { provide: GetContactExecutiveSummaryHandler, useValue: mockSummaryHandler },
        { provide: GetChurnRiskPredictionHandler, useValue: mockChurnHandler },
      ],
    }).compile()

    controller = module.get<AiController>(AiController)
    jest.clearAllMocks()
  })

  // ── Win Probability ───────────────────────────────
  describe('GET /ai/deals/:dealId/win-probability', () => {
    it('should return win probability prediction for a valid deal', async () => {
      mockWinProbHandler.execute.mockResolvedValue(fakePrediction)

      const result = await controller.getDealWinProbability(DEAL_ID, TENANT)

      expect(result.winProbabilityPercent).toBe(87)
      expect(result.dealHealth).toBe('EXCELLENT')
      expect(result.dealName).toBe('Acme Enterprise Deal')
      expect(result.positiveFactors).toHaveLength(2)
      expect(mockWinProbHandler.execute).toHaveBeenCalledTimes(1)
    })

    it('should pass tenantId from header to the handler query', async () => {
      mockWinProbHandler.execute.mockResolvedValue(fakePrediction)

      await controller.getDealWinProbability(DEAL_ID, TENANT)

      expect(mockWinProbHandler.execute).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TENANT, dealId: DEAL_ID }),
      )
    })

    it('should return CRITICAL health for a stalled deal with no interactions', async () => {
      const stalledDeal = new DealWinPrediction(
        'pred-2', TENANT, DEAL_ID, 'Stalled Deal', 5000,
        8, 'CRITICAL',
        [],
        ['Sin interacciones en 45 días (-20%)', 'Sin propuesta formal enviada (-15%)'],
        ['Contactar de inmediato por WhatsApp', 'Generar cotización urgente'],
        '2026-09-15', new Date(),
      )
      mockWinProbHandler.execute.mockResolvedValue(stalledDeal)

      const result = await controller.getDealWinProbability(DEAL_ID, TENANT)

      expect(result.dealHealth).toBe('CRITICAL')
      expect(result.winProbabilityPercent).toBeLessThan(20)
      expect(result.riskFactors).toHaveLength(2)
    })
  })

  // ── Draft Generator ───────────────────────────────
  describe('POST /ai/drafts/generate', () => {
    it('should generate an EMAIL draft with PERSUASIVE tone and FOLLOW_UP objective', async () => {
      mockDraftHandler.execute.mockResolvedValue(fakeDraft)

      const result = await controller.generateMessageDraft(
        { channel: 'EMAIL', tone: 'PERSUASIVE', objective: 'FOLLOW_UP', contactId: CONTACT_ID, dealId: DEAL_ID },
        TENANT,
      )

      expect(result.channel).toBe('EMAIL')
      expect(result.tone).toBe('PERSUASIVE')
      expect(result.subject).toContain('Seguimiento')
      expect(result.bodyText).toBeTruthy()
      expect(mockDraftHandler.execute).toHaveBeenCalledTimes(1)
    })

    it('should generate a WHATSAPP draft with FRIENDLY tone for RE_ENGAGEMENT', async () => {
      const whatsappDraft = new GeneratedDraft(
        'draft-2', TENANT, CONTACT_ID, null,
        'WHATSAPP', 'FRIENDLY', 'RE_ENGAGEMENT',
        null, 'Hola Juan 👋! ¿Cómo estás? Queremos saber cómo podemos ayudarte.',
        12, new Date(),
      )
      mockDraftHandler.execute.mockResolvedValue(whatsappDraft)

      const result = await controller.generateMessageDraft(
        { channel: 'WHATSAPP', tone: 'FRIENDLY', objective: 'RE_ENGAGEMENT' },
        TENANT,
      )

      expect(result.channel).toBe('WHATSAPP')
      expect(result.bodyText).toContain('Juan')
    })

    it('should generate a NOTE draft for internal team use', async () => {
      const noteDraft = new GeneratedDraft(
        'draft-3', TENANT, CONTACT_ID, DEAL_ID,
        'NOTE', 'FORMAL', 'PROPOSAL_INTRODUCTION',
        null, 'NOTA: El cliente solicitó revisión del alcance antes de firma.',
        9, new Date(),
      )
      mockDraftHandler.execute.mockResolvedValue(noteDraft)

      const result = await controller.generateMessageDraft(
        { channel: 'NOTE', tone: 'FORMAL', objective: 'PROPOSAL_INTRODUCTION', dealId: DEAL_ID },
        TENANT,
      )

      expect(result.channel).toBe('NOTE')
      expect(result.bodyText).toBeTruthy()
    })
  })

  // ── Executive Summary ─────────────────────────────
  describe('GET /ai/contacts/:contactId/summary', () => {
    it('should return executive summary with POSITIVE sentiment', async () => {
      mockSummaryHandler.execute.mockResolvedValue(fakeSummary)

      const result = await controller.getContactExecutiveSummary(CONTACT_ID, TENANT)

      expect(result.sentiment).toBe('POSITIVE')
      expect(result.contactName).toBe('Juan García')
      expect(result.recommendedStrategy).toBeTruthy()
      expect(mockSummaryHandler.execute).toHaveBeenCalledTimes(1)
    })

    it('should return NEGATIVE sentiment for a high-risk contact with open tickets', async () => {
      const negativeSummary = new ContactExecutiveSummary(
        CONTACT_ID, 'María López',
        'El cliente tiene 3 tickets críticos abiertos sin resolver.',
        'NEGATIVE',
        ['3 tickets críticos sin resolver', 'Sin renovación en 90 días'],
        'Escalar al equipo de Customer Success para intervención inmediata',
        new Date(),
      )
      mockSummaryHandler.execute.mockResolvedValue(negativeSummary)

      const result = await controller.getContactExecutiveSummary(CONTACT_ID, TENANT)

      expect(result.sentiment).toBe('NEGATIVE')
      expect(result.keyPainPoints).toHaveLength(2)
    })
  })

  // ── Churn Risk ────────────────────────────────────
  describe('GET /ai/contacts/:contactId/churn-risk', () => {
    it('should return LOW churn risk for an active contact', async () => {
      mockChurnHandler.execute.mockResolvedValue(fakeChurn)

      const result = await controller.getChurnRiskPrediction(CONTACT_ID, TENANT)

      expect(result.churnRiskLevel).toBe('LOW')
      expect(result.churnRiskPercent).toBe(22)
      expect(result.preventiveActions).toHaveLength(2)
      expect(mockChurnHandler.execute).toHaveBeenCalledTimes(1)
    })

    it('should return HIGH churn risk for an inactive contact with open critical tickets', async () => {
      const highChurn = new ChurnRiskPrediction(
        CONTACT_ID, 'Roberto Sánchez', 78, 'HIGH',
        ['90 días sin interacción', '2 tickets críticos sin resolver'],
        ['Agendar llamada de rescate en 24h', 'Ofrecer descuento de retención del 25%', 'Escalar al CS Manager'],
        new Date(),
      )
      mockChurnHandler.execute.mockResolvedValue(highChurn)

      const result = await controller.getChurnRiskPrediction(CONTACT_ID, TENANT)

      expect(result.churnRiskLevel).toBe('HIGH')
      expect(result.churnRiskPercent).toBeGreaterThanOrEqual(75)
      expect(result.riskIndicators).toHaveLength(2)
      expect(result.preventiveActions.length).toBeGreaterThanOrEqual(2)
    })

    it('should return MEDIUM churn risk for a contact with mild inactivity', async () => {
      const mediumChurn = new ChurnRiskPrediction(
        CONTACT_ID, 'Laura Gómez', 45, 'MEDIUM',
        ['45 días sin interacción'],
        ['Enviar encuesta de satisfacción NPS', 'Ofrecer sesión de capacitación gratuita'],
        new Date(),
      )
      mockChurnHandler.execute.mockResolvedValue(mediumChurn)

      const result = await controller.getChurnRiskPrediction(CONTACT_ID, TENANT)

      expect(result.churnRiskLevel).toBe('MEDIUM')
      expect(result.churnRiskPercent).toBe(45)
    })
  })
})
