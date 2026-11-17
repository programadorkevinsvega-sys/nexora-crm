import { Injectable } from '@nestjs/common'
import { DomainEvent } from '@crm/shared'
import { getDb, outboxEvents } from '@crm/database'

@Injectable()
export class OutboxService {
  async publish(event: DomainEvent): Promise<void> {
    const db = getDb()
    const eventId = crypto.randomUUID()
    const occurredAt = new Date().toISOString()

    const enrichedPayload = {
      eventId,
      eventType: event.eventName,
      eventVersion: 1,
      occurredAt,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.toPrimitives(),
    }

    await db.insert(outboxEvents).values({
      id: eventId,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      eventType: event.eventName,
      payload: enrichedPayload as Record<string, unknown>,
      published: false,
    })
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event)
    }
  }
}
