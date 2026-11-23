import { WorkflowStepStatus } from '@crm/contracts'
import { cloneAndFreezeJson } from '../services/immutable-json'

export class WorkflowStepExecution {
  readonly outputData: Record<string, unknown> | null
  private readonly hasLegacyIdempotencyKey: boolean

  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly executionId: string,
    readonly stepId: string,
    readonly idempotencyKey: string,
    readonly status: WorkflowStepStatus,
    readonly attempts: number,
    outputData: Record<string, unknown> | null,
    readonly errorMessage: string | null,
    readonly startedAt: Date,
    readonly completedAt: Date | null,
    allowLegacyIdempotencyKey = false,
  ) {
    if (!Number.isSafeInteger(attempts) || attempts < 1) {
      throw new Error('Workflow step attempt must be a positive safe integer')
    }
    if (!stepId.trim()) {
      throw new Error('Workflow step id is required')
    }

    if (!idempotencyKey.trim()) {
      throw new Error('Workflow step idempotency key is required')
    }

    const expectedKey = `${executionId}_${stepId}_${attempts}`
    if (idempotencyKey !== expectedKey && !allowLegacyIdempotencyKey) {
      throw new Error('Workflow step idempotency key does not match execution, step, and attempt')
    }

    this.hasLegacyIdempotencyKey = idempotencyKey !== expectedKey
    this.outputData = cloneAndFreezeJson(outputData)
  }

  /**
   * Rehydrates persisted history without rewriting keys created by older
   * application versions. New records must still go through create(), which
   * always derives the canonical execution_step_attempt key.
   */
  static rehydrate(props: {
    id: string
    tenantId: string
    executionId: string
    stepId: string
    idempotencyKey: string
    status: WorkflowStepStatus
    attempts: number
    outputData: Record<string, unknown> | null
    errorMessage: string | null
    startedAt: Date
    completedAt: Date | null
  }): WorkflowStepExecution {
    return new WorkflowStepExecution(
      props.id,
      props.tenantId,
      props.executionId,
      props.stepId,
      props.idempotencyKey,
      props.status,
      props.attempts,
      props.outputData,
      props.errorMessage,
      props.startedAt,
      props.completedAt,
      true,
    )
  }

  static create(props: {
    tenantId: string
    executionId: string
    stepId: string
    attempt?: number
  }): WorkflowStepExecution {
    const attempt = props.attempt ?? 1
    if (!Number.isSafeInteger(attempt) || attempt < 1) {
      throw new Error('Workflow step attempt must be a positive safe integer')
    }
    if (!props.stepId.trim()) {
      throw new Error('Workflow step id is required')
    }

    const idempotencyKey = `${props.executionId}_${props.stepId}_${attempt}`
    return new WorkflowStepExecution(
      crypto.randomUUID(),
      props.tenantId,
      props.executionId,
      props.stepId,
      idempotencyKey,
      'PENDING',
      attempt,
      null,
      null,
      new Date(),
      null,
      this.hasLegacyIdempotencyKey,
    )
  }

  markExecuting(): WorkflowStepExecution {
    return new WorkflowStepExecution(
      this.id,
      this.tenantId,
      this.executionId,
      this.stepId,
      this.idempotencyKey,
      'EXECUTING',
      this.attempts,
      this.outputData,
      this.errorMessage,
      this.startedAt,
      null,
      this.hasLegacyIdempotencyKey,
    )
  }

  markSuccess(outputData?: Record<string, unknown>): WorkflowStepExecution {
    return new WorkflowStepExecution(
      this.id,
      this.tenantId,
      this.executionId,
      this.stepId,
      this.idempotencyKey,
      'SUCCESS',
      this.attempts,
      outputData ?? null,
      null,
      this.startedAt,
      new Date(),
      this.hasLegacyIdempotencyKey,
    )
  }

  markFailed(errorMessage: string): WorkflowStepExecution {
    return new WorkflowStepExecution(
      this.id,
      this.tenantId,
      this.executionId,
      this.stepId,
      this.idempotencyKey,
      'FAILED',
      this.attempts,
      this.outputData,
      errorMessage,
      this.startedAt,
      new Date(),
      this.hasLegacyIdempotencyKey,
    )
  }

  markSkipped(): WorkflowStepExecution {
    return new WorkflowStepExecution(
      this.id,
      this.tenantId,
      this.executionId,
      this.stepId,
      this.idempotencyKey,
      'SKIPPED',
      this.attempts,
      this.outputData,
      null,
      this.startedAt,
      new Date(),
      this.hasLegacyIdempotencyKey,
    )
  }
}
