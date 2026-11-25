import { randomUUID } from 'node:crypto'
import { stderr } from 'node:process'
import { format } from 'node:util'

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

export interface JetStreamMessage {
  readonly data: Uint8Array
  readonly subject: string
  ack(): void
  nak(delay?: number): void
}

export interface JetStreamConsumerRuntime {
  fetch(options: { max_messages: number; expires: number }): Promise<AsyncIterable<JetStreamMessage>>
}

export interface JetStreamRuntime {
  consumers: { get(streamName: string, consumerName: string): Promise<JetStreamConsumerRuntime> }
}

export interface JetStreamManagerRuntime {
  consumers: {
    add(streamName: string, config: ConsumerConfig): Promise<unknown>
    update(streamName: string, consumerName: string, config: ConsumerConfig): Promise<unknown>
  }
}

export interface NatsConnectionRuntime {
  jetstreamManager(): Promise<JetStreamManagerRuntime>
}

export interface ConsumerConfig {
  name: string
  durable_name: string
  filter_subjects: string[]
  ack_policy: 'explicit'
  max_deliver: number
}

export interface NatsConsumerPersistence {
  isAlreadyProcessed(eventId: string, handler: string): Promise<boolean>
  recordProcessed(eventId: string, tenantId: string | null, handler: string): Promise<void>
  moveToDeadLetter(message: JetStreamMessage, reason: string): Promise<void>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function eventTenantId(payload: Record<string, unknown>): string | null {
  return typeof payload.tenantId === 'string' && payload.tenantId.length > 0
    ? payload.tenantId
    : null
}

export abstract class NatsConsumer {
  protected abstract readonly serviceName: string
  protected abstract readonly subjects: string[]
  protected abstract readonly persistence: NatsConsumerPersistence
  protected abstract readonly natsConnection: NatsConnectionRuntime | null
  protected abstract readonly jetStream: JetStreamRuntime | null
  protected handlers: ConsumerHandler[] = []
  private consumer: JetStreamConsumerRuntime | null = null
  private running = false

  registerHandler(
    eventType: string,
    handler: (payload: Record<string, unknown>, eventId: string, subject: string) => Promise<void>,
  ): void {
    this.handlers.push({ eventType, handler })
  }

  async start(): Promise<void> {
    if (this.running) return
    const connection = this.natsConnection
    const jetStream = this.jetStream
    if (!connection || !jetStream || this.subjects.length === 0) return

    this.running = true
    try {
      const streamName = 'crm'
      const configName = `${this.serviceName}-consumer`
      const manager = await connection.jetstreamManager()
      const consumerConfig: ConsumerConfig = {
        name: configName,
        durable_name: configName,
        filter_subjects: this.subjects,
        ack_policy: 'explicit',
        max_deliver: 3,
      }
      try {
        await manager.consumers.add(streamName, consumerConfig)
      } catch {
        await manager.consumers.update(streamName, configName, consumerConfig)
      }
      this.consumer = await jetStream.consumers.get(streamName, configName)
      void this.pollLoop()
    } catch (error: unknown) {
      this.running = false
      const message = error instanceof Error ? error.message : String(error)
      stderr.write(`${format('[%s] Failed to start consumer: %s', this.serviceName, message)}\n`)
    }
  }

  private async pollLoop(): Promise<void> {
    while (this.running) {
      try {
        const consumer = this.consumer
        if (!consumer) throw new Error('JetStream consumer is not initialized')
        const messages = await consumer.fetch({ max_messages: 10, expires: 5000 })
        for await (const message of messages) {
          await this.handleMessage(message)
        }
      } catch {
        // Fetch expiry and transient transport errors are retried by the next poll.
      }
    }
  }

  private async handleMessage(message: JetStreamMessage): Promise<void> {
    try {
      const parsed: unknown = JSON.parse(message.data.toString())
      if (!isRecord(parsed)) throw new TypeError('Event payload must be a JSON object')
      const subject = message.subject
      const eventId = typeof parsed.eventId === 'string' && parsed.eventId.length > 0
        ? parsed.eventId
        : randomUUID()
      if (await this.persistence.isAlreadyProcessed(eventId, subject)) {
        message.ack()
        return
      }
      await this.processEvent(subject, parsed, eventId)
      await this.persistence.recordProcessed(eventId, eventTenantId(parsed), subject)
      message.ack()
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error)
      stderr.write(`${format('[%s] Error processing message: %s', this.serviceName, reason)}\n`)
      message.nak(10000)
      await this.persistence.moveToDeadLetter(message, reason)
    }
  }

  private async processEvent(subject: string, payload: Record<string, unknown>, eventId: string): Promise<void> {
    const eventType = subject.split('.').slice(1).join('.')
    for (const handler of this.handlers) {
      if (handler.eventType === '*' || handler.eventType === eventType) {
        await handler.handler(payload, eventId, subject)
      }
    }
  }

  async stop(): Promise<void> {
    this.running = false
    this.consumer = null
  }
}
