import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { getDb, outboxEvents } from '@crm/database'
import { eq } from 'drizzle-orm'
import { NatsService } from '../nats/nats.service'

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
            const envelope = event.payload as Record<string, any>
            const schedule = (envelope.payload ?? envelope) as Record<string, unknown>
            await this.nats.publishScheduled(
              schedule,
              String(schedule.resumeAt),
              event.id,
            )
          } else {
            await this.nats.publish(
              `crm.${event.eventType}`,
              {
                eventId: event.id,
                aggregateType: event.aggregateType,
                aggregateId: event.aggregateId,
                eventType: event.eventType,
                payload: event.payload,
                occurredOn: event.createdAt,
              } as Record<string, unknown>,
            )
          }

          await db
            .update(outboxEvents)
            .set({ published: true })
            .where(eq(outboxEvents.id, event.id))
        } catch (error) {
          this.logger.error(`Failed to publish event ${event.id}: ${error}`)
        }
      }
    } catch (error) {
      this.logger.error(`Outbox publisher error: ${error}`)
    } finally {
      this.publishing = false
    }
  }
}
