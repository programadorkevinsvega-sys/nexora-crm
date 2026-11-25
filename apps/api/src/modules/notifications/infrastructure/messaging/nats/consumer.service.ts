import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { AckPolicy, connect, JetStreamClient, JetStreamManager, NatsConnection } from 'nats'
import { getDb, notificationInboxEvents, notificationEventDeadLetters } from '@crm/database'
import { sendToDeadLetter } from '@crm/shared'
import { eq, and } from 'drizzle-orm'
import { UsersGrpcClient } from '../../../../../common/grpc/users-grpc.client'

const MAX_DELIVER = 3
const SERVICE = 'notifications'
type Database = ReturnType<typeof getDb>
type EventPayload = Record<string, unknown>

function isRecord(value: unknown): value is EventPayload {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

@Injectable()
export class NotificationsEventConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsEventConsumerService.name)
  private connection: NatsConnection | null = null
  private jetStream: JetStreamClient | null = null
  private jsm: JetStreamManager | null = null
  private running = false
  private consumer: Awaited<ReturnType<JetStreamClient['consumers']['get']>> | null = null
  constructor(private readonly users: UsersGrpcClient) {}

  async onModuleInit(): Promise<void> {
    const rawUrl = process.env.NATS_URL ?? "nats://127.0.0.1:4222"
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
      const streamName = 'USERS'
      const configName = `notifications-consumer-2`
      try {
        await this.jsm!.consumers.add(streamName, { name: configName, durable_name: configName, ack_policy: AckPolicy.Explicit, max_deliver: MAX_DELIVER, filter_subject: 'users.user.created' })
      } catch {
        try { await this.jsm!.consumers.update(streamName, configName, { filter_subject: 'users.user.created', max_deliver: MAX_DELIVER }) } catch { /* consumer update ok */ }
      }
      this.consumer = await this.jetStream.consumers.get(streamName, configName)
      this.running = true
      void this.pollLoop()
      this.logger.log('Notifications event consumer started')
    } catch (error: unknown) { this.logger.error(`Failed to start consumer: ${errorMessage(error)}`) }
  }

  private async pollLoop(): Promise<void> {
    while (this.running) {
      try {
        if (!this.consumer) throw new Error('Notifications JetStream consumer is not initialized')
        const messages = await this.consumer.fetch({ max_messages: 5, expires: 5000 })
        for await (const msg of messages) {
          let payload: EventPayload
          try {
            const parsed: unknown = JSON.parse(msg.data.toString())
            if (!isRecord(parsed)) throw new TypeError('Event payload must be a JSON object')
            payload = parsed
          } catch (error: unknown) {
            msg.term()
            this.logger.warn(`Terminated malformed event on ${msg.subject}: ${errorMessage(error)}`)
            continue
          }
          const eventId = requiredString(payload.eventId) ?? msg.seq.toString()
          const handlerName = `${SERVICE}:${msg.subject}`
          const db = getDb()
          try {
            if (await this.isProcessed(db, eventId, handlerName)) { msg.ack(); continue }
            await this.handleUserCreated(payload, eventId)
            await this.markProcessed(db, eventId, payload, handlerName)
            msg.ack()
          } catch (error: unknown) {
            const message = errorMessage(error)
            this.logger.error(`Processing error on ${msg.subject}: ${message}`)
            const dc = msg.info?.deliveryCount ?? 1
            if (dc >= MAX_DELIVER) {
              await sendToDeadLetter((record) => db.insert(notificationEventDeadLetters).values(record).onConflictDoNothing(), msg.subject, message, payload, SERVICE, dc)
              msg.term()
            } else {
              msg.nak(Math.min(60000, 5000 * Math.pow(2, dc)))
            }
          }
        }
      } catch { /* poll timeout, continue */ }
    }
  }

  private async handleUserCreated(payload: EventPayload, eventId: string): Promise<void> {
    const userId = requiredString(payload.userId) ?? requiredString(payload.id)
    const tenantId = requiredString(payload.tenantId)
    const email = requiredString(payload.email)
    this.logger.log(`User created event: ${userId || eventId}`)
    if (email && tenantId) {
      this.logger.log(`Welcome email ready for ${email}`)
      const user = userId ? await this.users.findById(tenantId, userId) : null
      if (user) { this.logger.log(`User lookup: ${user.id || email}`) }
    }
  }

  private async isProcessed(db: Database, eventId: string, handler: string): Promise<boolean> {
    try { const r = await db.select().from(notificationInboxEvents).where(and(eq(notificationInboxEvents.eventId, eventId), eq(notificationInboxEvents.handler, handler))).limit(1); return r.length > 0 }
    catch { /* not found */ return false }
  }

  private async markProcessed(db: Database, eventId: string, payload: EventPayload, handler: string): Promise<void> {
    try { await db.insert(notificationInboxEvents).values({ eventId, tenantId: requiredString(payload.tenantId), source: SERVICE, handler, processedAt: new Date() }).onConflictDoNothing() }
    catch { /* ignore insert errors */ }
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false
    if (this.connection) { await this.connection.drain(); this.logger.log('Consumer connection drained') }
  }
}
