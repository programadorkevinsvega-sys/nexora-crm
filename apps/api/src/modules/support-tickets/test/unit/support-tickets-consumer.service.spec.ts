import { SupportTicketsConsumerService } from '../../infrastructure/support-tickets-consumer.service'
import { CreateTicketHandler } from '../../application/commands/support-ticket.handlers'
import { NatsConsumerService, type DomainEventHandler } from '../../../../common/nats/nats-consumer.service'

describe('SupportTicketsConsumerService', () => {
  let service: SupportTicketsConsumerService
  let mockNatsConsumer: jest.Mocked<Partial<NatsConsumerService>>
  let mockCreateTicketHandler: jest.Mocked<Partial<CreateTicketHandler>>
  const subscriptions: Record<string, DomainEventHandler> = {}

  beforeEach(() => {
    mockNatsConsumer = {
      subscribe: jest.fn().mockImplementation((subject, queueGroup, handler) => {
        subscriptions[subject] = handler
        return Promise.resolve()
      }),
    }
    mockCreateTicketHandler = {
      execute: jest.fn().mockResolvedValue({ id: 'ticket-999' }),
    }

    service = new SupportTicketsConsumerService(
      mockNatsConsumer as NatsConsumerService,
      mockCreateTicketHandler as CreateTicketHandler,
    )
  })

  it('should subscribe to social and sentiment events on module init', async () => {
    await service.onModuleInit()

    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.social_inbox.comment_received',
      'support-tickets-social-engine',
      expect.any(Function),
    )
    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.ai.sentiment_analyzed',
      'support-tickets-social-engine',
      expect.any(Function),
    )
  })

  it('should auto-create HIGH priority support ticket when a social complaint is received', async () => {
    await service.onModuleInit()

    const handler = subscriptions['crm.social_inbox.comment_received']
    expect(handler).toBeDefined()

    await handler({
      eventId: 'evt-soc-1',
      eventType: 'social_inbox.comment_received',
      payload: {
        platform: 'INSTAGRAM',
        authorName: 'Maria Rodriguez',
        message: 'Tengo un reclamo urgente, el servicio presenta una falla grave y no me deja ingresar',
        contactId: 'cnt-404',
      },
    })

    expect(mockCreateTicketHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: '[INSTAGRAM] Reclamo de Maria Rodriguez',
        priority: 'HIGH',
        contactId: 'cnt-404',
      }),
    )
  })

  it('should auto-create URGENT support ticket when AI detects negative sentiment', async () => {
    await service.onModuleInit()

    const handler = subscriptions['crm.ai.sentiment_analyzed']
    expect(handler).toBeDefined()

    await handler({
      eventId: 'evt-ai-1',
      eventType: 'ai.sentiment_analyzed',
      payload: {
        sentiment: 'NEGATIVE',
        summary: 'Cliente furioso amenazando con cancelar el contrato de inmediato',
        contactId: 'cnt-500',
        confidence: 0.95,
      },
    })

    expect(mockCreateTicketHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: 'CRITICAL',
        contactId: 'cnt-500',
      }),
    )
  })
})
