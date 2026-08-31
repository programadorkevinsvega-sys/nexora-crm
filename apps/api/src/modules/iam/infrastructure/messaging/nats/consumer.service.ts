/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { AckPolicy, connect, JetStreamClient, JetStreamManager, NatsConnection } from 'nats'
import { getDb, iamInboxEvents, iamEventDeadLetters, userRoles, roles } from '@crm/database'
import { sendToDeadLetter } from '@crm/shared'
import { eq, and } from 'drizzle-orm'

const MAX_DELIVER = 3
const SERVICE = 'iam'

@Injectable()
export class IamEventConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IamEventConsumerService.name)
  private connection: NatsConnection | null = null
  private jetStream: JetStreamClient | null = null
  private jsm: JetStreamManager | null = null
  private running = false
  private consumer: any = null

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
      const configName = `iam-consumer-2`
      try {
        await this.jsm!.consumers.add(streamName, { name: configName, durable_name: configName, ack_policy: AckPolicy.Explicit, max_deliver: MAX_DELIVER, filter_subject: 'users.user.created' })
      } catch {
        try { await this.jsm!.consumers.update(streamName, configName, { filter_subject: 'users.user.created', max_deliver: MAX_DELIVER }) } catch { /* consumer update ok */ }
      }
      this.consumer = await this.jetStream.consumers.get(streamName, configName)
      this.running = true
      this.pollLoop()
      this.logger.log('IAM event consumer started')
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
            await this.assignDefaultRole(payload)
            await this.markProcessed(db, eventId, payload, handlerName)
            msg.ack()
          } catch (error: any) {
            this.logger.error(`Processing error on ${msg.subject}: ${error.message}`)
            const dc = ((msg as any).info?.deliveryCount ?? (msg as any).deliveryCount ?? 1) as number
            if (dc >= MAX_DELIVER) {
              await sendToDeadLetter(db, iamEventDeadLetters, msg.subject, error.message, payload, SERVICE, dc); (msg as any).term()
            } else {
              msg.nak(Math.min(60000, 5000 * Math.pow(2, dc)))
            }
          }
        }
      } catch { /* poll timeout, continue */ }
    }
  }

  private async assignDefaultRole(payload: any): Promise<void> {
    const tenantId = payload.tenantId; const userId = payload.userId ?? payload.id
    if (!tenantId || !userId) { this.logger.warn('Missing tenantId or userId'); return }
    const db = getDb()
    const defaultRole = await db.query.roles.findFirst({ where: and(eq(roles.name as any, 'user'), eq(roles.tenantId as any, tenantId)) })
    if (defaultRole) {
      await db.insert(userRoles).values({ roleId: defaultRole.id, userId, tenantId }).onConflictDoNothing()
      this.logger.log(`Assigned default role 'user' to user ${userId}`)
    }
  }

  private async isProcessed(db: any, eventId: string, handler: string): Promise<boolean> {
    try { const r = await db.select().from(iamInboxEvents).where(and(eq(iamInboxEvents.eventId, eventId), eq(iamInboxEvents.handler, handler))).limit(1); return r.length > 0 }
    catch { /* not found */ return false }
  }

  private async markProcessed(db: any, eventId: string, payload: any, handler: string): Promise<void> {
    try { await db.insert(iamInboxEvents).values({ eventId, tenantId: payload?.tenantId || null, source: SERVICE, handler, processedAt: new Date() }).onConflictDoNothing() }
    catch { /* ignore insert errors */ }
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false
    if (this.connection) { await this.connection.drain(); this.logger.log('Consumer connection drained') }
  }
}
