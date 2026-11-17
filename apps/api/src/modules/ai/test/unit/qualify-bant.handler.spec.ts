import { QualifyLeadBantHandler } from '../../application/commands/qualify-bant.handler'
import { OutboxService } from '../../../../common/outbox/outbox.service'

describe('QualifyLeadBantHandler', () => {
  let handler: QualifyLeadBantHandler
  let mockOutbox: jest.Mocked<Partial<OutboxService>>

  beforeEach(() => {
    mockOutbox = {
      publish: jest.fn().mockResolvedValue(undefined),
    }
    handler = new QualifyLeadBantHandler(mockOutbox as OutboxService)
  })

  it('should classify a decision maker with urgent need as SQL', async () => {
    const result = await handler.execute({
      tenantId: 'tenant-100',
      contactId: 'cnt-1',
      jobTitle: 'VP of Sales',
      messageOrNotes: 'Tenemos un problema urgente y necesitamos automatizar nuestro flujo esta semana. Cotización aprobada.',
      budgetDeclared: 15000,
    })

    expect(result.classification).toBe('SQL')
    expect(result.totalBantScore).toBeGreaterThanOrEqual(75)
    expect(mockOutbox.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregateId: 'cnt-1',
        classification: 'SQL',
      }),
    )
  })

  it('should classify moderate interest as MQL', async () => {
    const result = await handler.execute({
      tenantId: 'tenant-100',
      contactId: 'cnt-2',
      jobTitle: 'Analista de Operaciones',
      messageOrNotes: 'Hola, tenemos presupuesto para solicitar una cotización y conocer la plataforma.',
    })

    expect(result.classification).toBe('MQL')
    expect(result.totalBantScore).toBeGreaterThanOrEqual(50)
    expect(result.totalBantScore).toBeLessThan(75)
  })
})
