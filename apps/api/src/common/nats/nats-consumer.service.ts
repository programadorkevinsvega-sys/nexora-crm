import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { getDb, processedEvents } from '@crm/database'
import { NatsService } from './nats.service'
import { Subscription } from 'nats'

export interface DomainEventEnvelope<T = Record<string, unknown>> {
  eventId: string
  eventType: string
  aggregateType?: string
  aggregateId?: string
  payload: T
  occurredOn?: string | Date
}

export type DomainEventHandler<T = Record<string, unknown>> = (
  envelope: DomainEventEnvelope<T>,
) => Promise<void>

@Injectable()
export class NatsConsumerService implements OnModuleDestroy {
  private readonly logger = new Logger(NatsConsumerService.name)
  private readonly subscriptions: Subscription[] = []

  constructor(private readonly nats: NatsService) {}

  onModuleDestroy(): void {
    for (const sub of this.subscriptions) {
      try {
        sub.unsubscribe()
      } catch {
        // Safe cleanup
      }
    }
    this.subscriptions.length = 0
  }

  async subscribe<T = Record<string, unknown>>(
    subject: string,
    queueGroup: string,
    handler: DomainEventHandler<T>,
  ): Promise<void> {
    const connection = this.nats.getConnection()
    if (!connection) {
      this.logger.warn(`NATS not connected, delayed subscription to ${subject} (${queueGroup})`)
      return
    }

    try {
      const sub = connection.subscribe(subject, { queue: queueGroup })
      this.subscriptions.push(sub)
      this.logger.log(`Subscribed to subject "${subject}" in queueGroup "${queueGroup}"`)

      ;(async () => {
        for await (const msg of sub) {
          await this.processMessage(msg, queueGroup, handler)
        }
      })().catch((err) => {
        this.logger.error(`Error in subscription loop for ${subject}: ${err}`)
      })
    } catch (error) {
      this.logger.error(`Failed to subscribe to ${subject}: ${error}`)
    }
  }

  private async processMessage<T>(
    msg: any,
    queueGroup: string,
    handler: DomainEventHandler<T>,
  ): Promise<void> {
    let rawPayload: any
    try {
      const decoded = this.nats.getStringCodec().decode(msg.data)
      rawPayload = typeof decoded === 'string' ? JSON.parse(decoded) : decoded
    } catch {
      rawPayload = {}
    }

    const envelope: DomainEventEnvelope<T> = {
      eventId: rawPayload.eventId || msg.headers?.get?.('Nats-Msg-Id') || String(Date.now()),
      eventType: rawPayload.eventType || msg.subject?.replace(/^crm\./, '') || 'unknown',
      aggregateType: rawPayload.aggregateType,
      aggregateId: rawPayload.aggregateId,
      payload: (rawPayload.payload !== undefined ? rawPayload.payload : rawPayload) as T,
      occurredOn: rawPayload.occurredOn || new Date().toISOString(),
    }

    const isDuplicate = await this.isEventAlreadyProcessed(envelope.eventId, queueGroup)
    if (isDuplicate) {
      this.logger.debug(`Skipping duplicate event ${envelope.eventId} for consumer ${queueGroup}`)
      return
    }

    try {
      await handler(envelope)
      await this.markEventAsProcessed(envelope.eventId, envelope.eventType, queueGroup)
      this.logger.debug(`Successfully processed event ${envelope.eventId} (${envelope.eventType})`)
    } catch (error) {
      this.logger.error(`Failed to handle event ${envelope.eventId} (${envelope.eventType}): ${error}`)
    }
  }

  private async isEventAlreadyProcessed(eventId: string, queueGroup: string): Promise<boolean> {
    if (!process.env.DATABASE_URL) return false
    try {
      const db = getDb()
      const found = await db
        .select({ id: processedEvents.id })
        .from(processedEvents)
        .where(and(eq(processedEvents.eventId, eventId), eq(processedEvents.consumerGroup, queueGroup)))
        .limit(1)

      return found.length > 0
    } catch (error) {
      this.logger.warn(`Could not check event deduplication for ${eventId}: ${error}`)
      return false
    }
  }

  private async markEventAsProcessed(
    eventId: string,
    eventType: string,
    consumerGroup: string,
  ): Promise<void> {
    if (!process.env.DATABASE_URL) return
    try {
      const db = getDb()
      await db.insert(processedEvents).values({
        eventId,
        eventType,
        consumerGroup,
      })
    } catch (error) {
      this.logger.warn(`Failed to record processed event ${eventId}: ${error}`)
    }
  }
}
