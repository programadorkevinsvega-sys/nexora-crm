import { ContractsConsumerService } from '../../infrastructure/contracts-consumer.service'
import { CreateContractHandler } from '../../application/commands/contract.handlers'
import { NatsConsumerService, type DomainEventHandler } from '../../../../common/nats/nats-consumer.service'

describe('ContractsConsumerService', () => {
  let service: ContractsConsumerService
  let mockNatsConsumer: jest.Mocked<Partial<NatsConsumerService>>
  let mockCreateContractHandler: jest.Mocked<Partial<CreateContractHandler>>
  const subscriptions: Record<string, DomainEventHandler> = {}

  beforeEach(() => {
    mockNatsConsumer = {
      subscribe: jest.fn().mockImplementation((subject, queueGroup, handler) => {
        subscriptions[subject] = handler
        return Promise.resolve()
      }),
    }
    mockCreateContractHandler = {
      execute: jest.fn().mockResolvedValue({ id: 'contract-999' }),
    }

    service = new ContractsConsumerService(
      mockNatsConsumer as NatsConsumerService,
      mockCreateContractHandler as CreateContractHandler,
    )
  })

  it('should subscribe to deal won events on module init', async () => {
    await service.onModuleInit()

    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.deal.won',
      'contracts-deal-won-engine',
      expect.any(Function),
    )
  })

  it('should auto-create contract draft when deal won event arrives', async () => {
    await service.onModuleInit()

    const handler = subscriptions['crm.deal.won']
    expect(handler).toBeDefined()

    await handler({
      eventId: 'evt-deal-won-1',
      eventType: 'deal.won',
      payload: {
        dealId: 'deal-12345',
        tenantId: 'tenant-100',
        companyId: 'comp-100',
        name: 'Enterprise Cloud License',
        amount: 12000,
      },
    })

    expect(mockCreateContractHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId: 'deal-12345',
        tenantId: 'tenant-100',
        companyId: 'comp-100',
        mrrValue: 1000,
      }),
    )
  })
})
