import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { createHash } from 'node:crypto'
import { Job, JobsOptions, Queue } from 'bullmq'
import Redis from 'ioredis'
import { WorkflowStep } from '@crm/contracts'
import { WorkflowExecution } from '../domain/entities/workflow-execution.entity'

export const WORKFLOW_STEP_QUEUE_NAME = 'workflow-step-queue'
export const WORKFLOW_DEAD_LETTER_QUEUE_NAME = 'workflow-dead-letter-queue'

export type WorkflowQueueJobData =
  | {
      kind: 'PROCESS_EXECUTION'
      tenantId: string
      executionId: string
    }
  | {
      kind: 'RESUME_DELAY'
      tenantId: string
      executionId: string
      workflowId: string
      workflowVersion: number
      stepId: string
      resumeAt: string
    }

export interface WorkflowDeadLetterData {
  sourceQueue: string
  sourceJobId: string
  sourceJobName: string
  originalData: WorkflowQueueJobData
  attemptsMade: number
  failedReason: string
  failedAt: string
}

function positiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback
}

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 20)
}

@Injectable()
export class WorkflowQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkflowQueueService.name)
  private redis: Redis | null = null
  private workflowQueue: Queue<WorkflowQueueJobData> | null = null
  private deadLetterQueue: Queue<WorkflowDeadLetterData> | null = null
  private readonly prefix = process.env.WORKFLOW_QUEUE_PREFIX?.trim() || 'nexora-crm'
  private readonly attempts = positiveInteger(process.env.WORKFLOW_JOB_ATTEMPTS, 3)
  private readonly backoffMs = positiveInteger(process.env.WORKFLOW_JOB_BACKOFF_MS, 5_000)

  async onModuleInit(): Promise<void> {
    const redisUrl = process.env.REDIS_URL?.trim()
    if (!redisUrl) {
      throw new Error('REDIS_URL is required to run the workflow queue')
    }

    this.redis = new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
    })
    this.redis.on('error', (error: Error) => {
      this.logger.error(`Workflow queue Redis connection error: ${error.message}`)
    })

    await this.redis.connect()
    await this.redis.ping()

    const defaultJobOptions: JobsOptions = {
      attempts: this.attempts,
      backoff: { type: 'exponential', delay: this.backoffMs },
      removeOnComplete: { age: 86_400, count: 10_000 },
      removeOnFail: false,
    }

    this.workflowQueue = new Queue<WorkflowQueueJobData>(WORKFLOW_STEP_QUEUE_NAME, {
      connection: this.redis,
      prefix: this.prefix,
      defaultJobOptions,
    })
    this.deadLetterQueue = new Queue<WorkflowDeadLetterData>(WORKFLOW_DEAD_LETTER_QUEUE_NAME, {
      connection: this.redis,
      prefix: this.prefix,
    })

    await Promise.all([
      this.workflowQueue.waitUntilReady(),
      this.deadLetterQueue.waitUntilReady(),
    ])
    this.logger.log(
      `Workflow queues ready (prefix=${this.prefix}, attempts=${this.attempts}, backoff=${this.backoffMs}ms)`,
    )
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      this.workflowQueue?.close(),
      this.deadLetterQueue?.close(),
    ])
    if (this.redis && this.redis.status !== 'end') {
      await this.redis.quit()
    }
  }

  async enqueueExecution(execution: WorkflowExecution): Promise<void> {
    const queue = this.requireWorkflowQueue()
    await queue.add(
      'process-execution',
      {
        kind: 'PROCESS_EXECUTION',
        tenantId: execution.tenantId,
        executionId: execution.id,
      },
      this.jobOptions(`workflow-${execution.id}-process`),
    )
  }

  async scheduleDelay(
    execution: WorkflowExecution,
    step: WorkflowStep,
    resumeAt: Date,
  ): Promise<void> {
    const queue = this.requireWorkflowQueue()
    const stepHash = digest(step.id)
    const jobId = `workflow-${execution.id}-${stepHash}-${resumeAt.getTime()}`
    await queue.add(
      'resume-delay',
      {
        kind: 'RESUME_DELAY',
        tenantId: execution.tenantId,
        executionId: execution.id,
        workflowId: execution.workflowId,
        workflowVersion: execution.version,
        stepId: step.id,
        resumeAt: resumeAt.toISOString(),
      },
      this.jobOptions(jobId, Math.max(0, resumeAt.getTime() - Date.now())),
    )
  }

  async getFailedJobs(start = 0, end = 99): Promise<Job<WorkflowQueueJobData>[]> {
    return this.requireWorkflowQueue().getFailed(start, end)
  }

  async moveToDeadLetter(
    job: Job<WorkflowQueueJobData>,
    error?: Error | null,
  ): Promise<void> {
    const sourceJobId = String(job.id ?? job.name)
    const payload: WorkflowDeadLetterData = {
      sourceQueue: WORKFLOW_STEP_QUEUE_NAME,
      sourceJobId,
      sourceJobName: job.name,
      originalData: job.data,
      attemptsMade: job.attemptsMade,
      failedReason: error?.message ?? job.failedReason ?? 'Unknown workflow job failure',
      failedAt: new Date().toISOString(),
    }

    await this.requireDeadLetterQueue().add(
      'workflow-dead-letter',
      payload,
      {
        jobId: `workflow-dlq-${digest(`${WORKFLOW_STEP_QUEUE_NAME}:${sourceJobId}`)}`,
        attempts: 1,
        removeOnComplete: false,
        removeOnFail: false,
      },
    )
    await job.remove()
    this.logger.error(
      `Workflow job ${sourceJobId} exhausted its retries and was moved to the DLQ`,
    )
  }

  getQueuePrefix(): string {
    return this.prefix
  }

  getConcurrency(): number {
    return positiveInteger(process.env.WORKFLOW_QUEUE_CONCURRENCY, 5)
  }

  private jobOptions(jobId: string, delay?: number): JobsOptions {
    return {
      jobId,
      attempts: this.attempts,
      backoff: { type: 'exponential', delay: this.backoffMs },
      ...(delay !== undefined ? { delay } : {}),
      removeOnComplete: { age: 86_400, count: 10_000 },
      removeOnFail: false,
    }
  }

  private requireWorkflowQueue(): Queue<WorkflowQueueJobData> {
    if (!this.workflowQueue) {
      throw new Error('Workflow queue is not initialized')
    }
    return this.workflowQueue
  }

  private requireDeadLetterQueue(): Queue<WorkflowDeadLetterData> {
    if (!this.deadLetterQueue) {
      throw new Error('Workflow dead-letter queue is not initialized')
    }
    return this.deadLetterQueue
  }
}
