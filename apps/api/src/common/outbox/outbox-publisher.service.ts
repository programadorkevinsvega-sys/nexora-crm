import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { getDb, outboxEvents } from '@crm/database'
import { eq } from 'drizzle-orm'
import { NatsService } from '../nats/nats.service'

type JsonObject = Record<string, unknown>

function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name)
  private intervalId: ReturnType<typeof setInterval> | null = null
  private publishing = false

  constructor(private readonly nats: NatsService) {}

  onModuleInit(): void {
    this.intervalId = setInterval(() => this.publishPendingEvents(), 5_000)
    void this.publishPendingEvents()
  }

  onModuleDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId)
  }

  async publishPendingEvents(): Promise<void> {
    if (this.publishing) return
    this.publishing = true

    try {
      const db = getDb()
      const pendingEvents = await db
        .select()
        .from(outboxEvents)
        .where(eq(outboxEvents.published, false))
        .limit(50)

      if (pendingEvents.length === 0) return
      this.logger.log(`Publishing ${pendingEvents.length} pending events`)

      for (const event of pendingEvents) {
        try {
          if (event.eventType === 'workflow.delay.schedule') {
            const envelope = isRecord(event.payload) ? event.payload : null
            if (!envelope) throw new Error(`Workflow schedule event ${event.id} payload must be an object`)
            const schedule = isRecord(envelope.payload) ? envelope.payload : envelope
            const resumeAt = schedule.resumeAt
            if (typeof resumeAt !== 'string' || Number.isNaN(new Date(resumeAt).getTime())) {
              throw new Error(`Workflow schedule event ${event.id} has an invalid resumeAt timestamp`)
            }
            await this.nats.publishScheduled(schedule, resumeAt, event.id)
          } else {
            const message: JsonObject = {
              eventId: event.id,
              aggregateType: event.aggregateType,
              aggregateId: event.aggregateId,
              eventType: event.eventType,
              payload: event.payload,
              occurredOn: event.createdAt,
            }
            await this.nats.publish(`crm.${event.eventType}`, message)
          }

          await db
            .update(outboxEvents)
            .set({ published: true })
            .where(eq(outboxEvents.id, event.id))
        } catch (error: unknown) {
          this.logger.error(`Failed to publish event ${event.id}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    } catch (error: unknown) {
      this.logger.error(`Outbox publisher error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      this.publishing = false
    }
  }
}
