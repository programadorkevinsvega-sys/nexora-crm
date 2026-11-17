import { AffiliatesConsumerService } from '../../infrastructure/affiliates-consumer.service'
import { RecordCommissionHandler } from '../../application/commands/record-commission.handler'
import { NatsConsumerService } from '../../../../common/nats/nats-consumer.service'

describe('AffiliatesConsumerService', () => {
  let service: AffiliatesConsumerService
  let mockNatsConsumer: jest.Mocked<Partial<NatsConsumerService>>
  let mockRecordCommissionHandler: jest.Mocked<Partial<RecordCommissionHandler>>
  const subscriptions: Record<string, Function> = {}

  beforeEach(() => {
    mockNatsConsumer = {
      subscribe: jest.fn().mockImplementation((subject, queueGroup, handler) => {
        subscriptions[subject] = handler
        return Promise.resolve()
      }),
    }
    mockRecordCommissionHandler = {
      execute: jest.fn().mockResolvedValue({ id: 'comm-999' }),
    }

    service = new AffiliatesConsumerService(
      mockNatsConsumer as NatsConsumerService,
      mockRecordCommissionHandler as RecordCommissionHandler,
    )
  })

  it('should subscribe to deal won events on module init', async () => {
    await service.onModuleInit()

    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.deal.won',
      'affiliates-deal-commission-engine',
      expect.any(Function),
    )
  })

  it('should record affiliate commission when deal won event contains affiliate reference', async () => {
    await service.onModuleInit()

    const handler = subscriptions['crm.deal.won']
    expect(handler).toBeDefined()

    await handler({
      eventId: 'evt-deal-won-aff-1',
      eventType: 'deal.won',
      payload: {
        dealId: 'deal-999',
        tenantId: 'tenant-100',
        affiliateId: 'aff-777',
        amount: 5000,
      },
    })

    expect(mockRecordCommissionHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        affiliateId: 'aff-777',
        tenantId: 'tenant-100',
        sourceOrderId: 'deal-999',
        commissionAmount: 500,
      }),
    )
  })
})
