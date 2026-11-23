import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { connect, headers, JetStreamClient, JetStreamManager, NatsConnection, StringCodec } from 'nats'

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsService.name)
  private connection: NatsConnection | null = null
  private jetStream: JetStreamClient | null = null
  private jsm: JetStreamManager | null = null
  private readonly sc = StringCodec()

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

      try {
        await this.jsm.streams.add({ name: 'crm', subjects: ['crm.>'] })
      } catch {
        await this.jsm.streams.update('crm', { subjects: ['crm.>'] })
      }

      await this.ensureWorkflowStreams()
      this.logger.log(`Connected to NATS at ${rawUrl}`)
    } catch (error) {
      this.logger.error(`Failed to connect or initialize NATS: ${error}`)
    }
  }

  private async ensureWorkflowStreams(): Promise<void> {
    if (!this.jsm) throw new Error('JetStream manager is not initialized')

    const runtimeConfig = {
      name: 'workflow_runtime',
      subjects: ['workflow.schedule', 'workflow.resume'],
      retention: 'limits',
      storage: 'file',
      num_replicas: Number(process.env.NATS_WORKFLOW_REPLICAS ?? 1),
      max_age: 90 * 24 * 60 * 60 * 1_000_000_000,
      duplicate_window: 10 * 60 * 1_000_000_000,
      allow_msg_schedules: true,
    }

    try {
      await this.jsm.streams.add(runtimeConfig as any)
    } catch {
      await this.jsm.streams.update('workflow_runtime', runtimeConfig as any)
    }

    const dlqConfig = {
      name: 'workflow_dlq',
      subjects: ['workflow.dlq'],
      retention: 'limits',
      storage: 'file',
      num_replicas: Number(process.env.NATS_WORKFLOW_REPLICAS ?? 1),
      max_age: 365 * 24 * 60 * 60 * 1_000_000_000,
    }

    try {
      await this.jsm.streams.add(dlqConfig as any)
    } catch {
      await this.jsm.streams.update('workflow_dlq', dlqConfig as any)
    }
  }

  async ensureWorkflowConsumer(): Promise<void> {
    if (!this.jsm) throw new Error('JetStream manager is not connected')

    try {
      await this.jsm.consumers.info('workflow_runtime', 'workflow-runtime-worker')
      return
    } catch {
      // The durable pull consumer is created on first worker startup.
    }

    await this.jsm.consumers.add('workflow_runtime', {
      durable_name: 'workflow-runtime-worker',
      filter_subject: 'workflow.resume',
      ack_policy: 'explicit',
      ack_wait: 60 * 1_000_000_000,
      max_deliver: 100,
      max_ack_pending: 32,
      backoff: [
        60 * 1_000_000_000,
        60 * 1_000_000_000,
        120 * 1_000_000_000,
        300 * 1_000_000_000,
      ],
      replay_policy: 'instant',
    } as any)
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connection) {
      await this.connection.drain()
      this.logger.log('NATS connection drained')
    }
  }

  getConnection(): NatsConnection | null {
    return this.connection
  }

  getJetStream(): JetStreamClient | null {
    return this.jetStream
  }

  getStringCodec() {
    return this.sc
  }

  async publish(subject: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.jetStream) throw new Error(`NATS JetStream is not connected; cannot publish to ${subject}`)

    const encoded = this.sc.encode(JSON.stringify(payload))
    await this.jetStream.publish(subject, encoded)
    this.logger.debug(`Published to ${subject}`)
  }

  async publishScheduled(
    payload: Record<string, unknown>,
    resumeAt: string,
    messageId: string,
  ): Promise<void> {
    if (!this.jetStream) throw new Error('NATS JetStream is not connected; cannot schedule workflow')

    const resumeDate = new Date(resumeAt)
    if (Number.isNaN(resumeDate.getTime())) {
      throw new Error('Workflow schedule must target a valid timestamp')
    }

    // If the relay was offline past the due date, publish the resume event now.
    // The resume token makes this safe if the original scheduled event also exists.
    if (resumeDate.getTime() <= Date.now()) {
      await this.jetStream.publish(
        'workflow.resume',
        this.sc.encode(JSON.stringify(payload)),
        { msgID: `workflow-resume-${messageId}` },
      )
      return
    }

    const messageHeaders = headers()
    messageHeaders.set('Nats-Schedule', `@at ${resumeDate.toISOString()}`)
    messageHeaders.set('Nats-Schedule-Target', 'workflow.resume')

    await this.jetStream.publish(
      'workflow.schedule',
      this.sc.encode(JSON.stringify(payload)),
      { msgID: `workflow-delay-${messageId}`, headers: messageHeaders },
    )
  }

  async publishDeadLetter(
    payload: Record<string, unknown>,
    reason: string,
    deliveryCount: number,
  ): Promise<void> {
    if (!this.jetStream) throw new Error('NATS JetStream is not connected; cannot persist workflow DLQ record')

    const executionId = String(payload.executionId ?? 'unknown')
    const resumeToken = String(payload.resumeToken ?? 'unknown')
    const messageId = `workflow-dlq-${executionId}-${resumeToken}`
    const deadLetter = {
      original: payload,
      reason,
      deliveryCount,
      failedAt: new Date().toISOString(),
    }

    await this.jetStream.publish(
      'workflow.dlq',
      this.sc.encode(JSON.stringify(deadLetter)),
      { msgID: messageId },
    )
  }
}
