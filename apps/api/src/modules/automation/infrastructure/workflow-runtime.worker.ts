import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { WorkflowEngineService } from '../application/services/workflow-engine.service'
import { WorkflowDelayScheduleMessage } from '../domain/repositories/workflow-execution.repository'
import { NatsService } from '../../../common/nats/nats.service'

const MAX_WORKFLOW_DELIVERIES = 5

@Injectable()
export class WorkflowRuntimeWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkflowRuntimeWorker.name)
  private subscription: any = null
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
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false
    this.subscription?.unsubscribe()
    this.subscription = null
  }

  private async consume(): Promise<void> {
    await this.nats.ensureWorkflowConsumer()
    const connection = this.nats.getConnection()
    if (!connection) throw new Error('NATS connection is unavailable for workflow worker')

    const js = connection.jetstream()
    this.subscription = await js.pullSubscribe('workflow.resume', 'workflow-runtime-worker')

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
    let payload: WorkflowDelayScheduleMessage
    try {
      payload = JSON.parse(this.nats.getStringCodec().decode(message.data)) as WorkflowDelayScheduleMessage
      this.validatePayload(payload)
    } catch (error) {
      this.logger.error(`Discarding malformed workflow schedule message: ${error}`)
      message.term()
      return
    }

    const info = message.info ?? {}
    const deliveryCount = Number(
      info.deliveryCount ?? ((info.redeliveryCount ?? 0) + 1),
    ) || 1

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
