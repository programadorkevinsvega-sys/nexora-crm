import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { consumerOpts } from 'nats'
import type { JsMsg, NatsConnection } from 'nats'
import { WorkflowEngineService } from '../application/services/workflow-engine.service'
import type { WorkflowDelayScheduleMessage } from '../domain/repositories/workflow-execution.repository'
import { NatsService } from '../../../common/nats/nats.service'

const MAX_WORKFLOW_DELIVERIES = 5
type PullSubscription = Awaited<ReturnType<ReturnType<NatsConnection['jetstream']>['pullSubscribe']>>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseWorkflowDelayScheduleMessage(value: unknown): WorkflowDelayScheduleMessage {
  if (!isRecord(value)
    || typeof value.tenantId !== 'string'
    || typeof value.executionId !== 'string'
    || typeof value.workflowId !== 'string'
    || typeof value.workflowVersion !== 'number'
    || !Number.isSafeInteger(value.workflowVersion)
    || typeof value.stepId !== 'string'
    || (value.nextStepId !== null && typeof value.nextStepId !== 'string')
    || typeof value.resumeAt !== 'string'
    || typeof value.resumeToken !== 'string') {
    throw new TypeError('Workflow delay payload does not match its contract')
  }
  return {
    tenantId: value.tenantId,
    executionId: value.executionId,
    workflowId: value.workflowId,
    workflowVersion: value.workflowVersion,
    stepId: value.stepId,
    nextStepId: value.nextStepId,
    resumeAt: value.resumeAt,
    resumeToken: value.resumeToken,
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

@Injectable()
export class WorkflowRuntimeWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkflowRuntimeWorker.name)
  private subscription: PullSubscription | null = null
  private advisorySubscription: PullSubscription | null = null
  private running = false

  constructor(
    private readonly nats: NatsService,
    private readonly engine: WorkflowEngineService,
  ) {}

  onModuleInit(): void {
    this.running = true
    void this.consume().catch((error: unknown) => {
      this.logger.error(`Workflow runtime worker stopped unexpectedly: ${errorMessage(error)}`)
    })
    void this.consumeAdvisories().catch((error: unknown) => {
      this.logger.error(`Workflow DLQ advisory worker stopped unexpectedly: ${errorMessage(error)}`)
    })
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false
    this.subscription?.unsubscribe()
    this.advisorySubscription?.unsubscribe()
    this.subscription = null
    this.advisorySubscription = null
  }

  private async consume(): Promise<void> {
    await this.nats.ensureWorkflowConsumer()
    const connection = this.nats.getConnection()
    if (!connection) throw new Error('NATS connection is unavailable for workflow worker')

    const js = connection.jetstream()
    const consumerOptions = consumerOpts()
    consumerOptions.bind('workflow_runtime', 'workflow-runtime-worker')
    consumerOptions.manualAck()
    this.subscription = await js.pullSubscribe('', consumerOptions)

    this.logger.log('Workflow JetStream durable pull consumer is ready')
    while (this.running) {
      try {
        const subscription = this.subscription
        if (!subscription) break
        const batch = await subscription.fetch(10, { maxWait: 5_000 })
        for await (const message of batch) await this.processMessage(message)
      } catch (error: unknown) {
        if (this.running) {
          this.logger.warn(`Workflow pull failed; the durable consumer will retry: ${errorMessage(error)}`)
        }
      }
    }
  }

  private async processMessage(message: JsMsg): Promise<void> {
    const info = message.info
    const deliveryCount = info.deliveryCount || info.redeliveryCount + 1 || 1
    let payload: WorkflowDelayScheduleMessage
    let rawPayload = ''

    try {
      rawPayload = this.nats.getStringCodec().decode(message.data)
      const parsed: unknown = JSON.parse(rawPayload)
      payload = parseWorkflowDelayScheduleMessage(parsed)
      this.validatePayload(payload)
    } catch (error: unknown) {
      const reason = `Invalid workflow schedule payload: ${errorMessage(error)}`
      await this.nats.publishDeadLetter(
        { rawPayload },
        reason,
        deliveryCount,
        `malformed-${String(info.streamSequence)}`,
      )
      message.ack()
      this.logger.error(reason)
      return
    }

    const heartbeat = setInterval(() => {
      try {
        message.working()
      } catch (error: unknown) {
        this.logger.warn(`Could not extend workflow message acknowledgement: ${errorMessage(error)}`)
      }
    }, 20_000)

    try {
      const result = await this.engine.resumeScheduledExecution(payload)
      if (result?.status === 'FAILED') throw new Error(result.errorMessage ?? 'Workflow step failed')
      message.ack()
    } catch (error: unknown) {
      const reason = errorMessage(error)
      if (deliveryCount >= MAX_WORKFLOW_DELIVERIES) {
        await this.nats.publishDeadLetter({ ...payload }, reason, deliveryCount)
        message.ack()
        this.logger.error(
          `Workflow execution ${payload.executionId} moved to workflow.dlq after ${deliveryCount} deliveries: ${reason}`,
        )
      } else {
        const retryDelayMs = Math.min(300_000, 5_000 * (2 ** (deliveryCount - 1)))
        message.nak(retryDelayMs)
        this.logger.warn(
          `Workflow execution ${payload.executionId} failed on delivery ${deliveryCount}; retrying in ${retryDelayMs}ms: ${reason}`,
        )
      }
    } finally {
      clearInterval(heartbeat)
    }
  }

  private async consumeAdvisories(): Promise<void> {
    await this.nats.ensureWorkflowAdvisoryConsumer()
    const connection = this.nats.getConnection()
    if (!connection) throw new Error('NATS connection is unavailable for workflow DLQ advisory worker')

    const js = connection.jetstream()
    const consumerOptions = consumerOpts()
    consumerOptions.bind('workflow_advisories', 'workflow-dlq-advisory-worker')
    consumerOptions.manualAck()
    this.advisorySubscription = await js.pullSubscribe('', consumerOptions)

    this.logger.log('Workflow JetStream DLQ advisory consumer is ready')
    while (this.running) {
      try {
        const subscription = this.advisorySubscription
        if (!subscription) break
        const batch = await subscription.fetch(10, { maxWait: 5_000 })
        for await (const message of batch) await this.processMaxDeliverAdvisory(message)
      } catch (error: unknown) {
        if (this.running) {
          this.logger.warn(`Workflow DLQ advisory pull failed; the durable consumer will retry: ${errorMessage(error)}`)
        }
      }
    }
  }

  private async processMaxDeliverAdvisory(message: JsMsg): Promise<void> {
    const manager = this.nats.getJetStreamManager()
    if (!manager) throw new Error('NATS JetStream manager is unavailable')

    try {
      const parsed: unknown = JSON.parse(this.nats.getStringCodec().decode(message.data))
      if (!isRecord(parsed)
        || parsed.stream !== 'workflow_runtime'
        || parsed.consumer !== 'workflow-runtime-worker'
        || typeof parsed.stream_seq !== 'number'
        || !Number.isSafeInteger(parsed.stream_seq)
        || parsed.stream_seq < 1) {
        throw new Error('Invalid max-deliveries advisory identity')
      }

      const sequence = parsed.stream_seq
      const stored = await manager.streams.getMessage('workflow_runtime', sequence)
      const raw = this.nats.getStringCodec().decode(stored.data)
      let payload: Record<string, unknown>
      try {
        const storedPayload: unknown = JSON.parse(raw)
        payload = isRecord(storedPayload)
          ? storedPayload
          : { rawPayload: raw, stream: parsed.stream, streamSequence: sequence }
      } catch {
        payload = { rawPayload: raw, stream: parsed.stream, streamSequence: sequence }
      }

      const deliveries = typeof parsed.deliveries === 'number' && Number.isSafeInteger(parsed.deliveries)
        ? parsed.deliveries
        : MAX_WORKFLOW_DELIVERIES
      await this.nats.publishDeadLetter(
        payload,
        'JetStream maximum delivery attempts exceeded (worker unavailable or acknowledgement timeout)',
        deliveries,
        `stream-sequence-${sequence}`,
      )

      await manager.streams.deleteMessage('workflow_runtime', sequence)
      message.ack()
      this.logger.error(`Workflow message ${sequence} moved to workflow_dlq after broker delivery limit`)
    } catch (error: unknown) {
      this.logger.error(`Could not persist workflow max-deliveries advisory: ${errorMessage(error)}`)
      message.nak(30_000)
    }
  }

  private validatePayload(payload: WorkflowDelayScheduleMessage): void {
    if (
      !payload.tenantId ||
      !payload.executionId ||
      !payload.workflowId ||
      !Number.isSafeInteger(payload.workflowVersion) ||
      !payload.stepId ||
      !payload.resumeToken ||
      !payload.resumeAt
    ) {
      throw new Error('Workflow delay message is missing required identity fields')
    }
    if (Number.isNaN(new Date(payload.resumeAt).getTime())) {
      throw new Error('Workflow delay message contains an invalid resumeAt')
    }
  }
}
