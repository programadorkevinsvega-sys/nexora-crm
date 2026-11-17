import { DeveloperWebhooksConsumerService } from '../../infrastructure/developer-webhooks-consumer.service'
import { DispatchWebhookEventHandler } from '../../application/commands/developer.handlers'
import { NatsConsumerService, type DomainEventHandler } from '../../../../common/nats/nats-consumer.service'

describe('DeveloperWebhooksConsumerService', () => {
  let service: DeveloperWebhooksConsumerService
  let mockNatsConsumer: jest.Mocked<Partial<NatsConsumerService>>
  let mockDispatchHandler: jest.Mocked<Partial<DispatchWebhookEventHandler>>
  const subscriptions: Record<string, DomainEventHandler> = {}

  beforeEach(() => {
    mockNatsConsumer = {
      subscribe: jest.fn().mockImplementation((subject, queueGroup, handler) => {
        subscriptions[subject] = handler
        return Promise.resolve()
      }),
    }
    mockDispatchHandler = {
      execute: jest.fn().mockResolvedValue({ dispatched: 2 }),
    }

    service = new DeveloperWebhooksConsumerService(
      mockNatsConsumer as NatsConsumerService,
      mockDispatchHandler as DispatchWebhookEventHandler,
    )
  })

  it('should subscribe to external sync events on module init', async () => {
    await service.onModuleInit()

    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.contact.created',
      'developer-external-webhooks-engine',
      expect.any(Function),
    )
    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.deal.won',
      'developer-external-webhooks-engine',
      expect.any(Function),
    )
  })

  it('should dispatch external webhook when contact created event arrives', async () => {
    await service.onModuleInit()

    const handler = subscriptions['crm.contact.created']
    expect(handler).toBeDefined()

    await handler({
      eventId: 'evt-ext-1',
      eventType: 'contact.created',
      payload: {
        contactId: 'cnt-ext-100',
        tenantId: 'tenant-100',
        email: 'ceo@externalcorp.com',
      },
    })

    expect(mockDispatchHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-100',
        event: 'contact.created',
        payload: expect.objectContaining({
          contactId: 'cnt-ext-100',
          email: 'ceo@externalcorp.com',
        }),
      }),
    )
  })
})
