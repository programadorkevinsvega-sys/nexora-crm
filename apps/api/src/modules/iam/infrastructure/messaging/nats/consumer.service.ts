import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { AckPolicy, connect, JetStreamClient, JetStreamManager, NatsConnection } from 'nats'
import { getDb, iamInboxEvents, iamEventDeadLetters, userRoles, roles } from '@crm/database'
import { sendToDeadLetter } from '@crm/shared'
import { eq, and } from 'drizzle-orm'

const MAX_DELIVER = 3
const SERVICE = 'iam'
type Database = ReturnType<typeof getDb>
type EventPayload = Record<string, unknown>

function isRecord(value: unknown): value is EventPayload {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function requiredString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

@Injectable()
export class IamEventConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IamEventConsumerService.name)
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
      const streamName = 'USERS'
      const configName = 'iam-consumer-2'
      try {
        await this.jsm.consumers.add(streamName, {
          name: configName,
          durable_name: configName,
          ack_policy: AckPolicy.Explicit,
          max_deliver: MAX_DELIVER,
          filter_subject: 'users.user.created',
        })
      } catch {
        try {
          await this.jsm.consumers.update(streamName, configName, {
            filter_subject: 'users.user.created',
            max_deliver: MAX_DELIVER,
          })
        } catch {
          // Existing consumer configuration is already usable.
        }
      }
      this.consumer = await this.jetStream.consumers.get(streamName, configName)
      this.running = true
      void this.pollLoop()
      this.logger.log('IAM event consumer started')
    } catch (error: unknown) {
      this.logger.error(`Failed to start consumer: ${getErrorMessage(error)}`)
    }
  }

  private async pollLoop(): Promise<void> {
    while (this.running) {
      try {
        if (!this.consumer) throw new Error('IAM JetStream consumer is not initialized')
        const messages = await this.consumer.fetch({ max_messages: 5, expires: 5000 })
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
          const eventId = requiredString(payload.eventId) ?? msg.seq.toString()
          const handlerName = `${SERVICE}:${msg.subject}`
          const db = getDb()
          try {
            if (await this.isProcessed(db, eventId, handlerName)) {
              msg.ack()
              continue
            }
            await this.assignDefaultRole(payload)
            await this.markProcessed(db, eventId, payload, handlerName)
            msg.ack()
          } catch (error: unknown) {
            const message = getErrorMessage(error)
            this.logger.error(`Processing error on ${msg.subject}: ${message}`)
            const deliveryCount = msg.info?.deliveryCount ?? 1
            if (deliveryCount >= MAX_DELIVER) {
              await sendToDeadLetter(db, iamEventDeadLetters, msg.subject, message, payload, SERVICE, deliveryCount)
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

  private async assignDefaultRole(payload: EventPayload): Promise<void> {
    const tenantId = requiredString(payload.tenantId)
    const userId = requiredString(payload.userId) ?? requiredString(payload.id)
    if (!tenantId || !userId) {
      this.logger.warn('Missing tenantId or userId; default role was not assigned')
      return
    }

    const db = getDb()
    const matchingRoles = await db.select().from(roles)
      .where(and(eq(roles.name, 'user'), eq(roles.tenantId, tenantId)))
      .limit(1)
    const defaultRole = matchingRoles[0]
    if (!defaultRole) return

    await db.insert(userRoles).values({ roleId: defaultRole.id, userId, tenantId }).onConflictDoNothing()
    this.logger.log(`Assigned default role 'user' to user ${userId}`)
  }

  private async isProcessed(db: Database, eventId: string, handler: string): Promise<boolean> {
    try {
      const rows = await db.select().from(iamInboxEvents)
        .where(and(eq(iamInboxEvents.eventId, eventId), eq(iamInboxEvents.handler, handler)))
        .limit(1)
      return rows.length > 0
    } catch {
      return false
    }
  }

  private async markProcessed(db: Database, eventId: string, payload: EventPayload, handler: string): Promise<void> {
    try {
      await db.insert(iamInboxEvents).values({
        eventId,
        tenantId: requiredString(payload.tenantId),
        source: SERVICE,
        handler,
        processedAt: new Date(),
      }).onConflictDoNothing()
    } catch {
      throw new Error(`Failed to persist processed event ${eventId}`)
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false
    if (this.connection) {
      await this.connection.drain()
      this.logger.log('Consumer connection drained')
    }
  }
}
