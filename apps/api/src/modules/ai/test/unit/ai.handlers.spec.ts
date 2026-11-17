import { GenerateMessageDraftHandler } from '../../application/commands/ai.handlers'
import {
  GetDealWinProbabilityHandler,
  GetContactExecutiveSummaryHandler,
  GetChurnRiskPredictionHandler,
} from '../../application/queries/ai.handlers'
import { GenerateMessageDraftCommand } from '../../application/commands/ai.commands'
import {
  GetDealWinProbabilityQuery,
  GetContactExecutiveSummaryQuery,
  GetChurnRiskPredictionQuery,
} from '../../application/queries/ai.queries'
import { AiRepository } from '../../domain/repositories/ai.repository'
import { DealWinPrediction } from '../../domain/entities/deal-win-prediction.entity'
import { GeneratedDraft } from '../../domain/entities/generated-draft.entity'
import { ContactExecutiveSummary } from '../../domain/entities/contact-summary.entity'
import { ChurnRiskPrediction } from '../../domain/entities/churn-prediction.entity'

describe('AI Handlers', () => {
  let repo: jest.Mocked<AiRepository>

  beforeEach(() => {
    repo = {
      predictDealWinProbability: jest.fn(),
      generateMessageDraft: jest.fn(),
      generateContactExecutiveSummary: jest.fn(),
      predictChurnRisk: jest.fn(),
    }
  })

  it('GetDealWinProbabilityHandler should return prediction', async () => {
    const pred = new DealWinPrediction(
      'pred-1',
      'tenant-1',
      'deal-1',
      'Licencia Enterprise',
      50000,
      85,
      'EXCELLENT',
      ['Propuesta aceptada'],
      [],
      ['Agendar llamada de cierre'],
      '2026-09-15',
      new Date(),
    )
    repo.predictDealWinProbability.mockResolvedValue(pred)

    const handler = new GetDealWinProbabilityHandler(repo)
    const res = await handler.execute(new GetDealWinProbabilityQuery('tenant-1', 'deal-1'))

    expect(res.winProbabilityPercent).toBe(85)
    expect(res.dealHealth).toBe('EXCELLENT')
    expect(repo.predictDealWinProbability).toHaveBeenCalledWith('tenant-1', 'deal-1')
  })

  it('GenerateMessageDraftHandler should return draft', async () => {
    const draft = new GeneratedDraft(
      'draft-1',
      'tenant-1',
      'contact-1',
      'deal-1',
      'EMAIL',
      'PERSUASIVE',
      'FOLLOW_UP',
      'Seguimiento Comercial',
      'Hola Juan...',
      25,
      new Date(),
    )
    repo.generateMessageDraft.mockResolvedValue(draft)

    const handler = new GenerateMessageDraftHandler(repo)
    const res = await handler.execute(
      new GenerateMessageDraftCommand('tenant-1', 'EMAIL', 'PERSUASIVE', 'FOLLOW_UP', 'contact-1', 'deal-1'),
    )

    expect(res.channel).toBe('EMAIL')
    expect(res.bodyText).toBe('Hola Juan...')
  })

  it('GetContactExecutiveSummaryHandler should return summary', async () => {
    const sum = new ContactExecutiveSummary(
      'contact-1',
      'Maria Lopez',
      'Relación positiva...',
      'POSITIVE',
      [],
      'Ofrecer upsell',
      new Date(),
    )
    repo.generateContactExecutiveSummary.mockResolvedValue(sum)

    const handler = new GetContactExecutiveSummaryHandler(repo)
    const res = await handler.execute(new GetContactExecutiveSummaryQuery('tenant-1', 'contact-1'))

    expect(res.sentiment).toBe('POSITIVE')
    expect(res.contactName).toBe('Maria Lopez')
  })

  it('GetChurnRiskPredictionHandler should return prediction', async () => {
    const churn = new ChurnRiskPrediction(
      'contact-1',
      'Maria Lopez',
      15,
      'LOW',
      ['Uso activo'],
      ['Continuar fidelización'],
      new Date(),
    )
    repo.predictChurnRisk.mockResolvedValue(churn)

    const handler = new GetChurnRiskPredictionHandler(repo)
    const res = await handler.execute(new GetChurnRiskPredictionQuery('tenant-1', 'contact-1'))

    expect(res.churnRiskLevel).toBe('LOW')
    expect(res.churnRiskPercent).toBe(15)
  })
})
