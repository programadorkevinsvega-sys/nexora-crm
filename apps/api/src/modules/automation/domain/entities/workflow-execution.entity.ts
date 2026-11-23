import { WorkflowExecutionStatus } from '@crm/contracts'
import { cloneAndFreezeJson } from '../services/immutable-json'

export class WorkflowExecution {
  readonly contextData: Record<string, unknown> | null

  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly workflowId: string,
    readonly version: number,
    readonly entityType: string,
    readonly entityId: string,
    readonly status: WorkflowExecutionStatus,
    readonly currentStepId: string,
    contextData: Record<string, unknown> | null,
    readonly startedAt: Date,
    readonly completedAt: Date | null,
    readonly cancelledAt: Date | null,
    readonly errorMessage: string | null,
    readonly resumeAt: Date | null = null,
  ) {
    if (!Number.isSafeInteger(version) || version < 1) {
      throw new Error('Workflow execution version must be a positive integer')
    }
    this.contextData = cloneAndFreezeJson(contextData)
  }

  static start(props: {
    tenantId: string
    workflowId: string
    version: number
    entityType: string
    entityId: string
    initialStepId: string
    initialContext?: Record<string, unknown> | null
  }): WorkflowExecution {
    return new WorkflowExecution(
      crypto.randomUUID(),
      props.tenantId,
      props.workflowId,
      props.version,
      props.entityType,
      props.entityId,
      'RUNNING',
      props.initialStepId,
      props.initialContext ?? {},
      new Date(),
      null,
      null,
      null,
      null,
    )
  }

  advanceTo(nextStepId: string, updatedContext?: Record<string, unknown>): WorkflowExecution {
    return new WorkflowExecution(
      this.id,
      this.tenantId,
      this.workflowId,
      this.version,
      this.entityType,
      this.entityId,
      'RUNNING',
      nextStepId,
      updatedContext ?? this.contextData,
      this.startedAt,
      null,
      null,
      null,
      null,
    )
  }

  waitForDelay(stepId: string, resumeAt: Date, updatedContext?: Record<string, unknown>): WorkflowExecution {
    if (!(resumeAt instanceof Date) || Number.isNaN(resumeAt.getTime())) {
      throw new Error('Workflow delay resume time must be a valid date')
    }
    return new WorkflowExecution(
      this.id,
      this.tenantId,
      this.workflowId,
      this.version,
      this.entityType,
      this.entityId,
      'WAITING_DELAY',
      stepId,
      updatedContext ?? this.contextData,
      this.startedAt,
      null,
      null,
      null,
      resumeAt,
    )
  }

  resumeFromDelay(nextStepId: string): WorkflowExecution {
    if (this.status !== 'WAITING_DELAY' || !this.resumeAt) {
      throw new Error('Only a scheduled workflow delay can be resumed')
    }
    if (!nextStepId.trim()) {
      throw new Error('Next workflow step id is required to resume a delay')
    }

    return new WorkflowExecution(
      this.id,
      this.tenantId,
      this.workflowId,
      this.version,
      this.entityType,
      this.entityId,
      'RUNNING',
      nextStepId,
      this.contextData,
      this.startedAt,
      null,
      null,
      null,
      null,
    )
  }

  complete(finalContext?: Record<string, unknown>): WorkflowExecution {
    return new WorkflowExecution(
      this.id,
      this.tenantId,
      this.workflowId,
      this.version,
      this.entityType,
      this.entityId,
      'COMPLETED',
      this.currentStepId,
      finalContext ?? this.contextData,
      this.startedAt,
      new Date(),
      null,
      null,
      null,
    )
  }

  cancel(reason?: string): WorkflowExecution {
    return new WorkflowExecution(
      this.id,
      this.tenantId,
      this.workflowId,
      this.version,
      this.entityType,
      this.entityId,
      'CANCELLED',
      this.currentStepId,
      this.contextData,
      this.startedAt,
      null,
      new Date(),
      reason ?? 'Cancelled by rule or user',
      null,
    )
  }

  fail(errorMessage: string): WorkflowExecution {
    return new WorkflowExecution(
      this.id,
      this.tenantId,
      this.workflowId,
      this.version,
      this.entityType,
      this.entityId,
      'FAILED',
      this.currentStepId,
      this.contextData,
      this.startedAt,
      null,
      null,
      errorMessage,
      null,
    )
  }
}
