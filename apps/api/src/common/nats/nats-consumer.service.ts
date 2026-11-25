import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { getDb, processedEvents } from '@crm/database'
import { NatsService } from './nats.service'
import { Msg, Subscription } from 'nats'

export interface DomainEventEnvelope {
  eventId: string
  eventType: string
  aggregateType?: string
  aggregateId?: string
  payload: Record<string, unknown>
  occurredOn?: string | Date
}

export type DomainEventHandler = (envelope: DomainEventEnvelope) => Promise<void>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

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

  async subscribe(subject: string, queueGroup: string, handler: DomainEventHandler): Promise<void> {
    const connection = this.nats.getConnection()
    if (!connection) {
      this.logger.warn(`NATS not connected, delayed subscription to ${subject} (${queueGroup})`)
      return
    }

    try {
      const sub = connection.subscribe(subject, { queue: queueGroup })
      this.subscriptions.push(sub)
      this.logger.log(`Subscribed to subject "${subject}" in queueGroup "${queueGroup}"`)

      void (async () => {
        for await (const msg of sub) {
          await this.processMessage(msg, queueGroup, handler)
        }
      })().catch((error: unknown) => {
        this.logger.error(`Error in subscription loop for ${subject}: ${error instanceof Error ? error.message : String(error)}`)
      })
    } catch (error: unknown) {
      this.logger.error(`Failed to subscribe to ${subject}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async processMessage(msg: Msg, queueGroup: string, handler: DomainEventHandler): Promise<void> {
    let parsedPayload: unknown
    try {
      const decoded = this.nats.getStringCodec().decode(msg.data)
      parsedPayload = JSON.parse(decoded) as unknown
    } catch (error: unknown) {
      this.logger.error(`Invalid JSON on ${msg.subject}: ${error instanceof Error ? error.message : String(error)}`)
      return
    }

    if (!isRecord(parsedPayload)) {
      this.logger.error(`Ignoring non-object event on ${msg.subject}`)
      return
    }

    const rawPayload = parsedPayload
    const payload = isRecord(rawPayload.payload) ? rawPayload.payload : rawPayload
    const envelope: DomainEventEnvelope = {
      eventId: optionalString(rawPayload.eventId) ?? msg.headers?.get('Nats-Msg-Id') ?? String(Date.now()),
      eventType: optionalString(rawPayload.eventType) ?? (msg.subject.replace(/^crm\./, '') || 'unknown'),
      aggregateType: optionalString(rawPayload.aggregateType),
      aggregateId: optionalString(rawPayload.aggregateId),
      payload,
      occurredOn: typeof rawPayload.occurredOn === 'string' || rawPayload.occurredOn instanceof Date
        ? rawPayload.occurredOn
        : new Date().toISOString(),
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
    } catch (error: unknown) {
      this.logger.error(`Failed to handle event ${envelope.eventId} (${envelope.eventType}): ${error instanceof Error ? error.message : String(error)}`)
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
    } catch (error: unknown) {
      this.logger.warn(`Could not check event deduplication for ${eventId}: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  private async markEventAsProcessed(eventId: string, eventType: string, consumerGroup: string): Promise<void> {
    if (!process.env.DATABASE_URL) return
    const db = getDb()
    await db.insert(processedEvents).values({ eventId, eventType, consumerGroup })
  }
}
