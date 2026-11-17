import { InteractionsConsumerService } from '../../infrastructure/interactions-consumer.service'
import { CreateCallHandler } from '../../application/commands/interactions.handlers'
import { NatsConsumerService, type DomainEventHandler } from '../../../../common/nats/nats-consumer.service'

describe('InteractionsConsumerService', () => {
  let service: InteractionsConsumerService
  let mockNatsConsumer: jest.Mocked<Partial<NatsConsumerService>>
  let mockCreateCallHandler: jest.Mocked<Partial<CreateCallHandler>>
  const subscriptions: Record<string, DomainEventHandler> = {}

  beforeEach(() => {
    mockNatsConsumer = {
      subscribe: jest.fn().mockImplementation((subject, queueGroup, handler) => {
        subscriptions[subject] = handler
        return Promise.resolve()
      }),
    }
    mockCreateCallHandler = {
      execute: jest.fn().mockResolvedValue({ id: 'call-999' }),
    }

    service = new InteractionsConsumerService(
      mockNatsConsumer as NatsConsumerService,
      mockCreateCallHandler as CreateCallHandler,
    )
  })

  it('should subscribe to call completed events on module init', async () => {
    await service.onModuleInit()

    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.call.completed',
      'interactions-voip-timeline-engine',
      expect.any(Function),
    )
  })

  it('should auto-create call interaction record when VoIP call completes', async () => {
    await service.onModuleInit()

    const handler = subscriptions['crm.call.completed']
    expect(handler).toBeDefined()

    await handler({
      eventId: 'evt-call-1',
      eventType: 'call.completed',
      payload: {
        contactId: 'cnt-888',
        tenantId: 'tenant-100',
        durationSeconds: 180,
        summary: 'Demo comercial realizada con éxito',
      },
    })

    expect(mockCreateCallHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        contactId: 'cnt-888',
        tenantId: 'tenant-100',
        durationSeconds: 180,
        summary: 'Demo comercial realizada con éxito',
      }),
    )
  })
})
