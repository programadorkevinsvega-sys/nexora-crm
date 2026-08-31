import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { getDb, outboxEvents } from '@crm/database'
import { eq } from 'drizzle-orm'
import { NatsService } from '../nats/nats.service'

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name)
  private intervalId: ReturnType<typeof setInterval> | null = null

  constructor(private readonly nats: NatsService) {}

  onModuleInit(): void {
    this.intervalId = setInterval(() => this.publishPendingEvents(), 5_000)
  }

  onModuleDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId)
  }

  async publishPendingEvents(): Promise<void> {
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
          await this.nats.publish(
            `crm.${event.eventType}`,
            event.payload as Record<string, unknown>,
          )

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
    }
  }
}
