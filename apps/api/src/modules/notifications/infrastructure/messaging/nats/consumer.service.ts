/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { AckPolicy, connect, JetStreamClient, JetStreamManager, NatsConnection } from 'nats'
import { getDb, notificationInboxEvents, notificationEventDeadLetters } from '@crm/database'
import { sendToDeadLetter } from '@crm/shared'
import { eq, and } from 'drizzle-orm'
import { UsersGrpcClient } from '../../../../../common/grpc/users-grpc.client'

const MAX_DELIVER = 3
const SERVICE = 'notifications'

@Injectable()
export class NotificationsEventConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsEventConsumerService.name)
  private connection: NatsConnection | null = null
  private jetStream: JetStreamClient | null = null
  private jsm: JetStreamManager | null = null
  private running = false
  private consumer: any = null
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
      this.pollLoop()
      this.logger.log('Notifications event consumer started')
    } catch (error) { this.logger.error(`Failed to start consumer: ${error}`) }
  }

  private async pollLoop(): Promise<void> {
    while (this.running) {
      try {
        const messages = await this.consumer.fetch({ batch: 5, expires: 5000 })
        for await (const msg of messages) {
          let payload: Record<string, unknown>
          try { payload = JSON.parse(msg.data.toString()) } catch { (msg as any).term(); continue }
          const eventId = (payload.eventId as string) || msg.seq.toString()
          const handlerName = `${SERVICE}:${msg.subject}`
          const db = getDb()
          try {
            if (await this.isProcessed(db, eventId, handlerName)) { msg.ack(); continue }
            await this.handleUserCreated(payload, eventId)
            await this.markProcessed(db, eventId, payload, handlerName)
            msg.ack()
          } catch (error: any) {
            this.logger.error(`Processing error on ${msg.subject}: ${error.message}`)
            const dc = ((msg as any).info?.deliveryCount ?? (msg as any).deliveryCount ?? 1) as number
            if (dc >= MAX_DELIVER) {
              await sendToDeadLetter((record) => db.insert(notificationEventDeadLetters).values(record).onConflictDoNothing(), msg.subject, error.message, payload, SERVICE, dc); (msg as any).term()
            } else {
              msg.nak(Math.min(60000, 5000 * Math.pow(2, dc)))
            }
          }
        }
      } catch { /* poll timeout, continue */ }
    }
  }

  private async handleUserCreated(payload: any, eventId: string): Promise<void> {
    const userId = payload.userId ?? payload.id
    this.logger.log(`User created event: ${userId || eventId}`)
    if (payload.email) {
      this.logger.log(`Welcome email ready for ${payload.email}`)
      const user = userId ? await this.users.findById(payload.tenantId, userId) : null
      if (user) { this.logger.log(`User lookup: ${user.id || payload.email}`) }
    }
  }

  private async isProcessed(db: any, eventId: string, handler: string): Promise<boolean> {
    try { const r = await db.select().from(notificationInboxEvents).where(and(eq(notificationInboxEvents.eventId, eventId), eq(notificationInboxEvents.handler, handler))).limit(1); return r.length > 0 }
    catch { /* not found */ return false }
  }

  private async markProcessed(db: any, eventId: string, payload: any, handler: string): Promise<void> {
    try { await db.insert(notificationInboxEvents).values({ eventId, tenantId: payload?.tenantId || null, source: SERVICE, handler, processedAt: new Date() }).onConflictDoNothing() }
    catch { /* ignore insert errors */ }
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false
    if (this.connection) { await this.connection.drain(); this.logger.log('Consumer connection drained') }
  }
}
