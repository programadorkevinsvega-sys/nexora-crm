import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { connect, JetStreamClient, JetStreamManager, NatsConnection, StringCodec } from 'nats'

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsService.name)
  private connection: NatsConnection | null = null
  private jetStream: JetStreamClient | null = null
  private jsm: JetStreamManager | null = null
  private readonly sc = StringCodec()

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

      try {
        await this.jsm!.streams.add({ name: 'crm', subjects: ['crm.>'] })
      } catch {
        await this.jsm!.streams.update('crm', { subjects: ['crm.>'] })
      }
      this.logger.log(`Connected to NATS at ${rawUrl}`)
    } catch (error) {
      this.logger.error(`Failed to connect to NATS: ${error}`)
    }
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

  getStringCodec() {
    return this.sc
  }

  async publish(subject: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.jetStream) {
      this.logger.warn(`NATS not connected, cannot publish to ${subject}`)
      return
    }

    try {
      const encoded = this.sc.encode(JSON.stringify(payload))
      await this.jetStream.publish(subject, encoded)
      this.logger.debug(`Published to ${subject}`)
    } catch (error) {
      this.logger.error(`Failed to publish to ${subject}: ${error}`)
      throw error
    }
  }
}
