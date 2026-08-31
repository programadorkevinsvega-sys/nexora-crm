/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'crypto'

export interface InboxRecord {
  eventId: string
  tenantId: string | null
  source: string
  handler: string
  processedAt: Date
}

export interface DeadLetterRecord {
  id: string
  outboxEventId: string
  subject: string
  reason: string
  payload: Record<string, unknown>
  attempts: number
  sourceService: string | null
  eventType: string | null
  createdAt: Date
}

export interface ConsumerHandler {
  eventType: string
  handler: (payload: Record<string, unknown>, eventId: string, subject: string) => Promise<void>
}

export abstract class NatsConsumer {
  protected abstract readonly serviceName: string
  protected abstract readonly subjects: string[]
  protected abstract getDb(): any
  protected abstract get inboxTable(): any
  protected abstract get deadLetterTable(): any
  protected abstract get natsConnection(): any
  protected abstract get jetStream(): any
  protected handlers: ConsumerHandler[] = []
  private consumer: any = null
  private running = false

  registerHandler(eventType: string, handler: (payload: Record<string, unknown>, eventId: string, subject: string) => Promise<void>): void {
    this.handlers.push({ eventType, handler })
  }

  async start(): Promise<void> {
    if (this.running) return
    this.running = true
    if (!this.jetStream) return
    try {
      const streamName = 'crm'
      const configName = `${this.serviceName}-consumer`
      try {
        await this.natsConnection?.jetstreamManager().then((jsm: any) =>
          jsm.consumers.add(streamName, { name: configName, filter_subject: this.subjects.join(' || '), durable_name: configName, ack_policy: 'explicit', max_deliver: 3 })
        )
      } catch {
        const jsm = await this.natsConnection?.jetstreamManager()
        await jsm.consumers.update(streamName, configName, { filter_subject: this.subjects.join(' || '), ack_policy: 'explicit', max_deliver: 3 })
      }
      this.consumer = await this.jetStream.consumers.get(streamName, configName)
      this.pollLoop()
    } catch (error) { console.error(`[${this.serviceName}] Failed to start consumer:`, error) }
  }

  private async pollLoop(): Promise<void> {
    while (this.running) {
      try {
        const messages = await this.consumer.fetch({ batch: 10, expires: 5000 })
        for await (const msg of messages) {
          try {
            const subject = msg.subject
            const payload = JSON.parse(msg.data.toString())
            const eventId = payload.eventId || randomUUID()
            const processed = await this.isAlreadyProcessed(eventId, subject)
            if (processed) { msg.ack(); continue }
            await this.processEvent(subject, payload, eventId)
            await this.recordProcessed(eventId, payload.tenantId, subject)
            msg.ack()
          } catch (error: any) {
            console.error(`[${this.serviceName}] Error processing message:`, error.message)
            msg.nak(10000)
            await this.moveToDeadLetter(msg, error.message)
          }
        }
      } catch { break }
    }
  }

  private async isAlreadyProcessed(eventId: string, handler: string): Promise<boolean> {
    try {
      const db = this.getDb()
      const row = await db.query[this.inboxTable._.name]?.findFirst({ where: (t: any) => t.eventId === eventId && t.handler === handler })
      return !!row
    } catch { return false }
  }

  private async recordProcessed(eventId: string, tenantId: string | null, handler: string): Promise<void> {
    const db = this.getDb()
    await db.insert(this.inboxTable).values({
      eventId, tenantId: tenantId || null, source: this.serviceName, handler, processedAt: new Date(),
    }).onConflictDoNothing()
  }

  private async processEvent(subject: string, payload: Record<string, unknown>, eventId: string): Promise<void> {
    const eventType = subject.split('.').slice(1).join('.')
    for (const h of this.handlers) {
      if (h.eventType === '*' || h.eventType === eventType) {
        await h.handler(payload, eventId, subject)
      }
    }
  }

  private async moveToDeadLetter(msg: any, reason: string): Promise<void> {
    try {
      const db = this.getDb()
      await db.insert(this.deadLetterTable).values({
        id: randomUUID(), outboxEventId: randomUUID(), subject: msg.subject, reason,
        payload: JSON.parse(msg.data.toString()), attempts: 1,
        sourceService: this.serviceName, eventType: msg.subject.split('.').slice(1).join('.'),
        createdAt: new Date(),
      })
    } catch {}
  }

  async stop(): Promise<void> { this.running = false; this.consumer = null }
}
