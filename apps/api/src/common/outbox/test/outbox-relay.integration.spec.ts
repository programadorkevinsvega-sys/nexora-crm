import { OutboxService } from '../outbox.service'
import { OutboxPublisherService } from '../outbox-publisher.service'
import { DomainEvent } from '@crm/shared'
import * as dbModule from '@crm/database'

class SampleCreatedEvent extends DomainEvent {
  aggregateType = 'Sample'
  eventName = 'sample.created'

  constructor(readonly aggregateId: string, readonly name: string) {
    super()
  }

  toPrimitives(): Record<string, unknown> {
    return { aggregateId: this.aggregateId, name: this.name }
  }
}

describe('Outbox & NATS JetStream Relay Integration', () => {
  let mockDb: any
  let mockNats: any

  beforeEach(() => {
    mockDb = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                id: 'evt-1',
                eventType: 'sample.created',
                payload: { name: 'Integration Test Entity' },
                published: false,
              },
            ]),
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)

    mockNats = {
      publish: jest.fn().mockResolvedValue(undefined),
    }
  })

  it('should write domain events to outbox table consistently', async () => {
    const service = new OutboxService()
    const event = new SampleCreatedEvent('agg-123', 'Integration Entity')

    await service.publish(event)

    expect(mockDb.insert).toHaveBeenCalled()
  })

  it('should poll unpublished outbox events and publish to NATS JetStream', async () => {
    const publisher = new OutboxPublisherService(mockNats)
    await publisher.publishPendingEvents()

    expect(mockNats.publish).toHaveBeenCalledWith(
      'crm.sample.created',
      { name: 'Integration Test Entity' },
    )
    expect(mockDb.update).toHaveBeenCalled()
  })
})
