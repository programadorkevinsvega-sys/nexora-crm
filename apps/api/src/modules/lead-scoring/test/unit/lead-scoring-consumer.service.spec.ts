import { LeadScoringConsumerService } from '../../infrastructure/lead-scoring-consumer.service'
import { RecalculateLeadScoreHandler } from '../../application/commands/score.handlers'
import { NatsConsumerService, type DomainEventHandler } from '../../../../common/nats/nats-consumer.service'

describe('LeadScoringConsumerService', () => {
  let service: LeadScoringConsumerService
  let mockNatsConsumer: jest.Mocked<Partial<NatsConsumerService>>
  let mockRecalculateHandler: jest.Mocked<Partial<RecalculateLeadScoreHandler>>
  const subscriptions: Record<string, DomainEventHandler> = {}

  beforeEach(() => {
    mockNatsConsumer = {
      subscribe: jest.fn().mockImplementation((subject, queueGroup, handler) => {
        subscriptions[subject] = handler
        return Promise.resolve()
      }),
    }
    mockRecalculateHandler = {
      execute: jest.fn().mockResolvedValue({} as any),
    }

    service = new LeadScoringConsumerService(
      mockNatsConsumer as NatsConsumerService,
      mockRecalculateHandler as RecalculateLeadScoreHandler,
    )
  })

  it('should register subscriptions on module init', async () => {
    await service.onModuleInit()

    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.contact.created',
      'lead-scoring-auto-engine',
      expect.any(Function),
    )
    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.web_forms.submitted',
      'lead-scoring-auto-engine',
      expect.any(Function),
    )
    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.meta_leads.received',
      'lead-scoring-auto-engine',
      expect.any(Function),
    )
  })

  it('should trigger score recalculation when contact created event is received', async () => {
    await service.onModuleInit()

    const contactCreatedHandler = subscriptions['crm.contact.created']
    expect(contactCreatedHandler).toBeDefined()

    await contactCreatedHandler({
      eventId: 'evt-1',
      eventType: 'contact.created',
      payload: {
        contactId: 'cnt-100',
        tenantId: 'tenant-100',
        firstName: 'Carlos',
        jobTitle: 'VP Sales',
      },
    })

    expect(mockRecalculateHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        contactId: 'cnt-100',
        tenantId: 'tenant-100',
        contactContext: expect.objectContaining({
          firstName: 'Carlos',
          jobTitle: 'VP Sales',
        }),
      }),
    )
  })

  it('should trigger score recalculation when web form submission is received', async () => {
    await service.onModuleInit()

    const formHandler = subscriptions['crm.web_forms.submitted']
    expect(formHandler).toBeDefined()

    await formHandler({
      eventId: 'evt-2',
      eventType: 'web_forms.submitted',
      payload: {
        contactId: 'cnt-200',
        tenantId: 'tenant-100',
        formName: 'Demo Request',
      },
    })

    expect(mockRecalculateHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        contactId: 'cnt-200',
        tenantId: 'tenant-100',
        contactContext: expect.objectContaining({
          hasFormSubmission: true,
        }),
      }),
    )
  })
})
