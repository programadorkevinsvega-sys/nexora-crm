import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Job, Worker } from 'bullmq'
import Redis from 'ioredis'
import { OutboxService } from '../../../common/outbox/outbox.service'
import { WorkflowExecutionFailedEvent } from '../domain/events/workflow.events'
import { WorkflowDefinitionRepository } from '../domain/repositories/workflow-definition.repository'
import { WorkflowExecutionRepository } from '../domain/repositories/workflow-execution.repository'
import { WorkflowEngineService } from '../application/services/workflow-engine.service'
import {
  WorkflowQueueJobData,
  WorkflowQueueService,
  WORKFLOW_STEP_QUEUE_NAME,
} from './workflow-queue.service'

@Injectable()
export class WorkflowWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkflowWorkerService.name)
  private connection: Redis | null = null
  private worker: Worker<WorkflowQueueJobData> | null = null

  constructor(
    private readonly executionRepo: WorkflowExecutionRepository,
    private readonly definitionRepo: WorkflowDefinitionRepository,
    private readonly engine: WorkflowEngineService,
    private readonly queue: WorkflowQueueService,
    private readonly outbox: OutboxService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queue.waitUntilReady()

    const redisUrl = process.env.REDIS_URL?.trim()
    if (!redisUrl) {
      throw new Error('REDIS_URL is required to run the workflow worker')
    }

    this.connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    })
    this.connection.on('error', (error: Error) => {
      this.logger.error(`Workflow worker Redis connection error: ${error.message}`)
    })

    this.worker = new Worker<WorkflowQueueJobData>(
      WORKFLOW_STEP_QUEUE_NAME,
      (job) => this.process(job),
      {
        connection: this.connection,
        prefix: this.queue.getQueuePrefix(),
        concurrency: this.queue.getConcurrency(),
        lockDuration: 30_000,
        maxStalledCount: 2,
      },
    )
    this.worker.on('error', (error: Error) => {
      this.logger.error(`Workflow worker error: ${error.message}`)
    })
    this.worker.on('failed', (job, error) => {
      if (!job) return
      const maxAttempts = job.opts.attempts ?? 1
      if (job.attemptsMade >= maxAttempts) {
        void this.handleFinalFailure(job, error).catch((failure: Error) => {
          this.logger.error(`Could not finalize failed workflow job: ${failure.message}`)
        })
      }
    })

    await this.worker.waitUntilReady()
    await this.recoverFailedJobs()
    this.logger.log(
      `Workflow worker ready (queue=${WORKFLOW_STEP_QUEUE_NAME}, concurrency=${this.queue.getConcurrency()})`,
    )
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close()
    this.worker = null
    if (this.connection && this.connection.status !== 'end') {
      await this.connection.quit()
    }
    this.connection = null
  }

  private async process(job: Job<WorkflowQueueJobData>): Promise<Record<string, unknown>> {
    const { tenantId, executionId } = job.data
    const execution = await this.executionRepo.findById(tenantId, executionId)
    if (!execution) {
      throw new Error(`Workflow execution ${executionId} was not found for tenant ${tenantId}`)
    }

    const definition = await this.definitionRepo.findById(tenantId, execution.workflowId)
    if (!definition || definition.version !== execution.version) {
      throw new Error(
        `Immutable workflow definition ${execution.workflowId}@${execution.version} was not found`,
      )
    }

    if (job.data.kind === 'PROCESS_EXECUTION') {
      if (execution.status === 'WAITING_DELAY') {
        if (!execution.resumeAt) {
          throw new Error(
            `Workflow execution ${execution.id} is waiting without a persisted resume time; manual review is required`,
          )
        }
        const delayStep = definition.stepsGraph.find(
          (step) => step.id === execution.currentStepId && step.type === 'DELAY',
        )
        if (!delayStep) {
          throw new Error(
            `Persisted delay step ${execution.currentStepId} was not found in the pinned workflow version`,
          )
        }

        // Recovery path for a process interrupted after Postgres was updated
        // but before the delayed job was confirmed in Redis.
        await this.queue.scheduleDelay(execution, delayStep, execution.resumeAt)
        return { status: 'WAITING_DELAY', recovered: true }
      }

      if (execution.status !== 'RUNNING') {
        return { status: execution.status, skipped: true }
      }

      const result = await this.engine.processExecution(execution, definition)
      return { status: result.status }
    }

    if (execution.status === 'WAITING_DELAY') {
      if (
        execution.workflowId !== job.data.workflowId ||
        execution.version !== job.data.workflowVersion ||
        execution.currentStepId !== job.data.stepId ||
        execution.resumeAt?.toISOString() !== job.data.resumeAt
      ) {
        return { status: execution.status, skipped: true, reason: 'stale-delay-job' }
      }

      const delayStep = definition.stepsGraph.find(
        (step) => step.id === job.data.stepId && step.type === 'DELAY',
      )
      if (!delayStep) {
        throw new Error(
          `Delay step ${job.data.stepId} was not found in workflow ${definition.id}@${definition.version}`,
        )
      }

      const result = await this.engine.resumeAfterDelay(execution, definition, delayStep)
      return { status: result.status }
    }

    // If a worker crashed after persisting the resume transition but before
    // finishing the remaining steps, the retried delayed job continues safely
    // from the execution's persisted currentStepId.
    if (execution.status === 'RUNNING') {
      const result = await this.engine.processExecution(execution, definition)
      return { status: result.status, recovered: true }
    }

    return { status: execution.status, skipped: true }
  }

  private async handleFinalFailure(
    job: Job<WorkflowQueueJobData>,
    error: Error,
  ): Promise<void> {
    const { tenantId, executionId } = job.data
    try {
      const execution = await this.executionRepo.findById(tenantId, executionId)
      if (execution && ['RUNNING', 'WAITING_DELAY'].includes(execution.status)) {
        const failed = execution.fail(error.message)
        await this.executionRepo.save(failed)
        await this.outbox.publish(
          new WorkflowExecutionFailedEvent(failed.id, failed.workflowId, error.message),
        )
      }
    } catch (persistError) {
      const message = persistError instanceof Error ? persistError.message : String(persistError)
      this.logger.error(`Could not persist final workflow failure for ${executionId}: ${message}`)
    }

    await this.queue.moveToDeadLetter(job, error)
  }

  private async recoverFailedJobs(): Promise<void> {
    const failedJobs = await this.queue.getFailedJobs(0, 999)
    for (const job of failedJobs) {
      const maxAttempts = job.opts.attempts ?? 1
      if (job.attemptsMade < maxAttempts) continue

      try {
        await this.handleFinalFailure(
          job,
          new Error(job.failedReason ?? 'Workflow job exhausted its retries before worker restart'),
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.logger.error(`Could not move failed job ${job.id} to the DLQ: ${message}`)
      }
    }
  }
}
