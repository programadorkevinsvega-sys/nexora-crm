import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { AckPolicy, connect, JetStreamClient, JetStreamManager, NatsConnection } from 'nats'
import { getDb, auditInboxEvents, auditEventDeadLetters, auditLogs } from '@crm/database'
import { sendToDeadLetter } from '@crm/shared'
import { eq, and } from 'drizzle-orm'

const MAX_DELIVER = 3
const SERVICE = 'audit'
type Database = ReturnType<typeof getDb>
type EventPayload = Record<string, unknown>

function isRecord(value: unknown): value is EventPayload {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

@Injectable()
export class AuditEventConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuditEventConsumerService.name)
  private connection: NatsConnection | null = null
  private jetStream: JetStreamClient | null = null
  private jsm: JetStreamManager | null = null
  private running = false
  private consumer: Awaited<ReturnType<JetStreamClient['consumers']['get']>> | null = null

  async onModuleInit(): Promise<void> {
    const rawUrl = process.env.NATS_URL ?? 'nats://127.0.0.1:4222'
    const parsed = new URL(rawUrl)
    try {
      this.connection = await connect({
        servers: `${parsed.hostname}:${parsed.port || 4222}`,
        user: parsed.username || undefined,
        pass: parsed.password || undefined,
        reconnect: true,
        maxReconnectAttempts: -1,
        reconnectTimeWait: 2000,
        timeout: 10000,
      })
      this.jetStream = this.connection.jetstream()
      this.jsm = await this.connection.jetstreamManager()
      const streamName = 'crm'
      const configName = 'audit-consumer-2'
      try {
        await this.jsm.consumers.add(streamName, {
          name: configName,
          durable_name: configName,
          ack_policy: AckPolicy.Explicit,
          max_deliver: MAX_DELIVER,
          filter_subject: 'crm.>',
        })
      } catch {
        try {
          await this.jsm.consumers.update(streamName, configName, {
            filter_subject: 'crm.>',
            max_deliver: MAX_DELIVER,
          })
        } catch {
          // Existing consumer configuration is already usable.
        }
      }
      this.consumer = await this.jetStream.consumers.get(streamName, configName)
      this.running = true
      void this.pollLoop()
      this.logger.log('Audit event consumer started')
    } catch (error: unknown) {
      this.logger.error(`Failed to start consumer: ${getErrorMessage(error)}`)
    }
  }

  private async pollLoop(): Promise<void> {
    while (this.running) {
      try {
        if (!this.consumer) throw new Error('Audit JetStream consumer is not initialized')
        const messages = await this.consumer.fetch({ max_messages: 10, expires: 5000 })
        for await (const msg of messages) {
          let parsedPayload: unknown
          try {
            parsedPayload = JSON.parse(msg.data.toString()) as unknown
          } catch {
            msg.term()
            this.logger.warn(`Terminated malformed event on ${msg.subject}`)
            continue
          }
          if (!isRecord(parsedPayload)) {
            msg.term()
            this.logger.warn(`Terminated non-object event on ${msg.subject}`)
            continue
          }

          const payload = parsedPayload
          const eventId = nullableString(payload.eventId) ?? msg.seq.toString()
          const handlerName = `${SERVICE}:${msg.subject}`
          const db = getDb()
          try {
            if (await this.isProcessed(db, eventId, handlerName)) {
              msg.ack()
              continue
            }
            await this.processEvent(msg.subject, payload, eventId, db)
            await this.markProcessed(db, eventId, payload, handlerName)
            msg.ack()
          } catch (error: unknown) {
            const message = getErrorMessage(error)
            this.logger.error(`Processing error on ${msg.subject}: ${message}`)
            const deliveryCount = msg.info?.deliveryCount ?? 1
            if (deliveryCount >= MAX_DELIVER) {
              await sendToDeadLetter((record) => db.insert(auditEventDeadLetters).values(record).onConflictDoNothing(), msg.subject, message, payload, SERVICE, deliveryCount)
              msg.term()
            } else {
              msg.nak(Math.min(60000, 5000 * Math.pow(2, deliveryCount)))
            }
          }
        }
      } catch {
        // Fetch timeout or transient poll error; continue while the service is active.
      }
    }
  }

  private async processEvent(subject: string, payload: EventPayload, eventId: string, db: Database): Promise<void> {
    const parts = subject.split('.')
    const moduleName = parts[0] === 'crm' ? (parts[1] || 'unknown') : parts[0]
    const action = parts[parts.length - 1]?.toUpperCase() || 'OTHER'
    const entityType = parts.length > 2 ? parts.slice(1, -1).join('.') : moduleName
    await db.insert(auditLogs).values({
      tenantId: nullableString(payload.tenantId),
      entityType,
      entityId: nullableString(payload.aggregateId) ?? eventId,
      action,
      moduleName,
      correlationId: nullableString(payload.correlationId),
      changedByUserId: nullableString(payload.changedByUserId) ?? nullableString(payload.uploadedByUserId),
      metadataJson: payload,
      createdAt: new Date(),
    }).onConflictDoNothing()
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false
    if (this.connection) {
      await this.connection.drain()
      this.logger.log('Consumer connection drained')
    }
  }

  private async isProcessed(db: Database, eventId: string, handler: string): Promise<boolean> {
    try {
      const rows = await db.select().from(auditInboxEvents)
        .where(and(eq(auditInboxEvents.eventId, eventId), eq(auditInboxEvents.handler, handler)))
        .limit(1)
      return rows.length > 0
    } catch {
      return false
    }
  }

  private async markProcessed(db: Database, eventId: string, payload: EventPayload, handler: string): Promise<void> {
    try {
      await db.insert(auditInboxEvents).values({
        eventId,
        tenantId: nullableString(payload.tenantId),
        source: SERVICE,
        handler,
        processedAt: new Date(),
      }).onConflictDoNothing()
    } catch {
      // A failed inbox write must be surfaced by retry behavior, not an unsafe type escape.
      throw new Error(`Failed to persist processed event ${eventId}`)
    }
  }
}
