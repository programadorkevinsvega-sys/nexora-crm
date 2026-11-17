import { WorkflowStepStatus } from '@crm/contracts'

export class WorkflowStepExecution {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly executionId: string,
    readonly stepId: string,
    readonly idempotencyKey: string,
    readonly status: WorkflowStepStatus,
    readonly attempts: number,
    readonly outputData: Record<string, unknown> | null,
    readonly errorMessage: string | null,
    readonly startedAt: Date,
    readonly completedAt: Date | null,
  ) {}

  static create(props: {
    tenantId: string
    executionId: string
    stepId: string
    attempt?: number
  }): WorkflowStepExecution {
    const attempt = props.attempt ?? 1
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
    )
  }
}
