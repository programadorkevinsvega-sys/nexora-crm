import { AutomationConsumerService } from '../../infrastructure/automation-consumer.service'
import { TriggerEventHandler } from '../../application/commands/workflow.handlers'
import { NatsConsumerService } from '../../../../common/nats/nats-consumer.service'

describe('AutomationConsumerService', () => {
  let service: AutomationConsumerService
  let mockNatsConsumer: jest.Mocked<Partial<NatsConsumerService>>
  let mockTriggerHandler: jest.Mocked<Partial<TriggerEventHandler>>
  const subscriptions: Record<string, Function> = {}

  beforeEach(() => {
    mockNatsConsumer = {
      subscribe: jest.fn().mockImplementation((subject, queueGroup, handler) => {
        subscriptions[subject] = handler
        return Promise.resolve()
      }),
    }
    mockTriggerHandler = {
      execute: jest.fn().mockResolvedValue({ triggeredCount: 1 }),
    }

    service = new AutomationConsumerService(
      mockNatsConsumer as NatsConsumerService,
      mockTriggerHandler as TriggerEventHandler,
    )
  })

  it('should subscribe to all major domain event subjects on module init', async () => {
    await service.onModuleInit()

    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.contact.created',
      'workflow-automation-engine',
      expect.any(Function),
    )
    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.deal.won',
      'workflow-automation-engine',
      expect.any(Function),
    )
    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.call.completed',
      'workflow-automation-engine',
      expect.any(Function),
    )
  })

  it('should trigger workflows when a contact created event is received', async () => {
    await service.onModuleInit()

    const handler = subscriptions['crm.contact.created']
    expect(handler).toBeDefined()

    await handler({
      eventId: 'evt-wf-1',
      eventType: 'contact.created',
      payload: {
        contactId: 'cnt-111',
        tenantId: 'tenant-100',
        firstName: 'Elena',
        leadSource: 'Web',
      },
    })

    expect(mockTriggerHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-100',
        eventName: 'contact.created',
        entityType: 'CONTACT',
        entityId: 'cnt-111',
      }),
    )
  })

  it('should trigger workflows when a deal won event is received', async () => {
    await service.onModuleInit()

    const handler = subscriptions['crm.deal.won']
    expect(handler).toBeDefined()

    await handler({
      eventId: 'evt-wf-2',
      eventType: 'deal.won',
      payload: {
        dealId: 'deal-222',
        tenantId: 'tenant-100',
        amount: 50000,
      },
    })

    expect(mockTriggerHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-100',
        eventName: 'deal.won',
        entityType: 'DEAL',
        entityId: 'deal-222',
      }),
    )
  })
})
