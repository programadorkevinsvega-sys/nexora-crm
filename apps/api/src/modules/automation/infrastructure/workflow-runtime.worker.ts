import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { consumerOpts } from 'nats'
import { WorkflowEngineService } from '../application/services/workflow-engine.service'
import { WorkflowDelayScheduleMessage } from '../domain/repositories/workflow-execution.repository'
import { NatsService } from '../../../common/nats/nats.service'

const MAX_WORKFLOW_DELIVERIES = 5

@Injectable()
export class WorkflowRuntimeWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkflowRuntimeWorker.name)
  private subscription: any = null
  private advisorySubscription: any = null
  private running = false

  constructor(
    private readonly nats: NatsService,
    private readonly engine: WorkflowEngineService,
  ) {}

  onModuleInit(): void {
    this.running = true
    void this.consume().catch((error) => {
      this.logger.error(`Workflow runtime worker stopped unexpectedly: ${error}`)
    })
    void this.consumeAdvisories().catch((error) => {
      this.logger.error(`Workflow DLQ advisory worker stopped unexpectedly: ${error}`)
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
        const batch = await this.subscription.fetch(10, { maxWait: 5_000 })
        for await (const message of batch) {
          await this.processMessage(message)
        }
      } catch (error) {
        if (this.running) {
          this.logger.warn(`Workflow pull failed; the durable consumer will retry: ${error}`)
        }
      }
    }
  }

  private async processMessage(message: any): Promise<void> {
    const info = message.info ?? {}
    const deliveryCount = Number(
      info.deliveryCount ?? ((info.redeliveryCount ?? 0) + 1),
    ) || 1
    let payload: WorkflowDelayScheduleMessage
    let rawPayload = ''

    try {
      rawPayload = this.nats.getStringCodec().decode(message.data)
      payload = JSON.parse(rawPayload) as WorkflowDelayScheduleMessage
      this.validatePayload(payload)
    } catch (error) {
      const reason = `Invalid workflow schedule payload: ${error instanceof Error ? error.message : String(error)}`
      await this.nats.publishDeadLetter(
        { rawPayload },
        reason,
        deliveryCount,
        `malformed-${String(info.streamSequence ?? Date.now())}`,
      )
      message.ack()
      this.logger.error(reason)
      return
    }

    const heartbeat = setInterval(() => {
      try {
        message.working()
      } catch (error) {
        this.logger.warn(`Could not extend workflow message acknowledgement: ${error}`)
      }
    }, 20_000)

    try {
      const result = await this.engine.resumeScheduledExecution(payload)
      if (result?.status === 'FAILED') {
        throw new Error(result.errorMessage ?? 'Workflow step failed')
      }
      message.ack()
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      if (deliveryCount >= MAX_WORKFLOW_DELIVERIES) {
        await this.nats.publishDeadLetter(payload as unknown as Record<string, unknown>, reason, deliveryCount)
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
        const batch = await this.advisorySubscription.fetch(10, { maxWait: 5_000 })
        for await (const message of batch) {
          await this.processMaxDeliverAdvisory(message)
        }
      } catch (error) {
        if (this.running) {
          this.logger.warn(`Workflow DLQ advisory pull failed; the durable consumer will retry: ${error}`)
        }
      }
    }
  }

  private async processMaxDeliverAdvisory(message: any): Promise<void> {
    const manager = this.nats.getJetStreamManager()
    if (!manager) throw new Error('NATS JetStream manager is unavailable')

    try {
      const advisory = JSON.parse(
        this.nats.getStringCodec().decode(message.data),
      ) as { stream?: string; consumer?: string; stream_seq?: number; deliveries?: number }

      if (
        advisory.stream !== 'workflow_runtime' ||
        advisory.consumer !== 'workflow-runtime-worker' ||
        !Number.isSafeInteger(advisory.stream_seq) ||
        Number(advisory.stream_seq) < 1
      ) {
        throw new Error('Invalid max-deliveries advisory identity')
      }

      const sequence = Number(advisory.stream_seq)
      const stored = await manager.streams.getMessage('workflow_runtime', sequence)
      const raw = this.nats.getStringCodec().decode(stored.data)
      let payload: Record<string, unknown>

      try {
        payload = JSON.parse(raw) as Record<string, unknown>
      } catch {
        payload = { rawPayload: raw, stream: advisory.stream, streamSequence: sequence }
      }

      await this.nats.publishDeadLetter(
        payload,
        'JetStream maximum delivery attempts exceeded (worker unavailable or acknowledgement timeout)',
        Number(advisory.deliveries ?? 5),
        `stream-sequence-${sequence}`,
      )

      await manager.streams.deleteMessage('workflow_runtime', sequence)
      message.ack()
      this.logger.error(`Workflow message ${sequence} moved to workflow_dlq after broker delivery limit`)
    } catch (error) {
      this.logger.error(`Could not persist workflow max-deliveries advisory: ${error}`)
      message.nak(30_000)
    }
  }

  private validatePayload(payload: WorkflowDelayScheduleMessage): void {
    if (
      !payload ||
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
