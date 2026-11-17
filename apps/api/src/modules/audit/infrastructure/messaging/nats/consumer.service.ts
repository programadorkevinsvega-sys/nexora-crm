/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { AckPolicy, connect, JetStreamClient, JetStreamManager, NatsConnection } from 'nats'
import { getDb, auditInboxEvents, auditEventDeadLetters, auditLogs } from '@crm/database'
import { sendToDeadLetter } from '@crm/shared'
import { eq, and } from 'drizzle-orm'

const MAX_DELIVER = 3
const SERVICE = 'audit'

@Injectable()
export class AuditEventConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuditEventConsumerService.name)
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
      const streamName = 'crm'
      const configName = `audit-consumer-2`
      try {
        await this.jsm!.consumers.add(streamName, { name: configName, durable_name: configName, ack_policy: AckPolicy.Explicit, max_deliver: MAX_DELIVER, filter_subject: 'crm.>' })
      } catch {
        try { await this.jsm!.consumers.update(streamName, configName, { filter_subject: 'crm.>', max_deliver: MAX_DELIVER }) } catch { /* consumer update ok */ }
      }
      this.consumer = await this.jetStream.consumers.get(streamName, configName)
      this.running = true
      this.pollLoop()
      this.logger.log('Audit event consumer started')
    } catch (error) { this.logger.error(`Failed to start consumer: ${error}`) }
  }

  private async pollLoop(): Promise<void> {
    while (this.running) {
      try {
        const messages = await this.consumer.fetch({ batch: 10, expires: 5000 })
        for await (const msg of messages) {
          let payload: Record<string, unknown>
          try { payload = JSON.parse(msg.data.toString()) } catch { (msg as any).term(); continue }
          const eventId = (payload.eventId as string) || msg.seq.toString()
          const handlerName = `${SERVICE}:${msg.subject}`
          const db = getDb()
          try {
            if (await this.isProcessed(db, eventId, handlerName)) { msg.ack(); continue }
            await this.processEvent(msg.subject, payload, eventId, db)
            await this.markProcessed(db, eventId, payload, handlerName)
            msg.ack()
          } catch (error: any) {
            this.logger.error(`Processing error on ${msg.subject}: ${error.message}`)
            const dc = ((msg as any).info?.deliveryCount ?? (msg as any).deliveryCount ?? 1) as number
            if (dc >= MAX_DELIVER) {
              await sendToDeadLetter(db, auditEventDeadLetters, msg.subject, error.message, payload, SERVICE, dc); (msg as any).term()
            } else {
              msg.nak(Math.min(60000, 5000 * Math.pow(2, dc)))
            }
          }
        }
      } catch { /* poll timeout, continue */ }
    }
  }

  private async processEvent(subject: string, payload: Record<string, unknown>, eventId: string, db: any): Promise<void> {
    const parts = subject.split('.')
    const moduleName = parts[0] === 'crm' ? (parts[1] || 'unknown') : parts[0]
    const action = parts[parts.length - 1]?.toUpperCase() || 'OTHER'
    const entityType = parts.length > 2 ? parts.slice(1, -1).join('.') : moduleName
    await db.insert(auditLogs).values({
      tenantId: (payload.tenantId as string) || null,
      entityType: entityType as string,
      entityId: (payload.aggregateId as string) || eventId,
      action,
      moduleName: moduleName as string,
      correlationId: (payload.correlationId as string) || null,
      changedByUserId: (payload.changedByUserId as string) || (payload.uploadedByUserId as string) || null,
      metadataJson: payload,
      createdAt: new Date(),
    }).onConflictDoNothing()
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false
    if (this.connection) { await this.connection.drain(); this.logger.log('Consumer connection drained') }
  }

  private async isProcessed(db: any, eventId: string, handler: string): Promise<boolean> {
    try { const r = await db.select().from(auditInboxEvents).where(and(eq(auditInboxEvents.eventId, eventId), eq(auditInboxEvents.handler, handler))).limit(1); return r.length > 0 }
    catch { /* not found */ return false }
  }

  private async markProcessed(db: any, eventId: string, payload: any, handler: string): Promise<void> {
    try { await db.insert(auditInboxEvents).values({ eventId, tenantId: payload?.tenantId || null, source: SERVICE, handler, processedAt: new Date() }).onConflictDoNothing() }
    catch { /* ignore insert errors */ }
  }
}
