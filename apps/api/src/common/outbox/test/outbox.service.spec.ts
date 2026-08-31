import { OutboxService } from '../outbox.service'
import { DomainEvent } from '@crm/shared'
import * as dbModule from '@crm/database'

class SampleDomainEvent extends DomainEvent {
  readonly aggregateType = 'sample'
  readonly aggregateId = 'sample-123'
  readonly eventName = 'sample.created'

  toPrimitives(): Record<string, unknown> {
    return { name: 'Test Sample' }
  }
}

describe('OutboxService', () => {
  it('should insert enriched domain event into outbox_events table', async () => {
    const mockInsert = jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined),
    })

    jest.spyOn(dbModule, 'getDb').mockReturnValue({
      insert: mockInsert,
    } as any)

    const outbox = new OutboxService()
    const event = new SampleDomainEvent()

    await outbox.publish(event)

    expect(mockInsert).toHaveBeenCalled()
  })
})
