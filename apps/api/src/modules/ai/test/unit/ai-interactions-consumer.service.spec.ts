import { AiInteractionsConsumerService } from '../../infrastructure/ai-interactions-consumer.service'
import { NatsConsumerService } from '../../../../common/nats/nats-consumer.service'
import { OutboxService } from '../../../../common/outbox/outbox.service'

describe('AiInteractionsConsumerService', () => {
  let service: AiInteractionsConsumerService
  let mockNatsConsumer: jest.Mocked<Partial<NatsConsumerService>>
  let mockOutbox: jest.Mocked<Partial<OutboxService>>
  const subscriptions: Record<string, Function> = {}

  beforeEach(() => {
    mockNatsConsumer = {
      subscribe: jest.fn().mockImplementation((subject, queueGroup, handler) => {
        subscriptions[subject] = handler
        return Promise.resolve()
      }),
    }
    mockOutbox = {
      publish: jest.fn().mockResolvedValue(undefined),
    }

    service = new AiInteractionsConsumerService(
      mockNatsConsumer as NatsConsumerService,
      mockOutbox as OutboxService,
    )
  })

  it('should subscribe to interaction events on module init', async () => {
    await service.onModuleInit()

    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.call.created',
      'ai-interactions-sentiment-engine',
      expect.any(Function),
    )
  })

  it('should analyze positive sentiment and publish SentimentAnalyzedEvent', async () => {
    await service.onModuleInit()

    const handler = subscriptions['crm.call.created']
    expect(handler).toBeDefined()

    await handler({
      eventId: 'evt-call-ai-1',
      eventType: 'call.created',
      payload: {
        callId: 'call-100',
        contactId: 'cnt-100',
        summary: 'Excelente reunión, el cliente está muy interesado en comprar la licencia',
      },
    })

    expect(mockOutbox.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'ai.sentiment_analyzed',
        sentiment: 'POSITIVE',
      }),
    )
  })

  it('should analyze negative sentiment when complaints are detected', async () => {
    await service.onModuleInit()

    const handler = subscriptions['crm.call.created']
    expect(handler).toBeDefined()

    await handler({
      eventId: 'evt-call-ai-2',
      eventType: 'call.created',
      payload: {
        callId: 'call-200',
        contactId: 'cnt-200',
        summary: 'Cliente molesto con una queja grave por error en la factura',
      },
    })

    expect(mockOutbox.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'ai.sentiment_analyzed',
        sentiment: 'NEGATIVE',
      }),
    )
  })
})
