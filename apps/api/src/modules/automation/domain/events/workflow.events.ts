import { DomainEvent } from '@crm/shared'

export class WorkflowExecutionStartedEvent extends DomainEvent {
  readonly aggregateType = 'workflow_execution'
  readonly eventName = 'workflow.execution.started'

  constructor(
    readonly aggregateId: string,
    readonly workflowId: string,
    readonly entityType: string,
    readonly entityId: string,
    readonly version: number,
  ) {
    super()
  }

  toPrimitives() {
    return {
      executionId: this.aggregateId,
      workflowId: this.workflowId,
      entityType: this.entityType,
      entityId: this.entityId,
      version: this.version,
    }
  }
}

export class WorkflowStepCompletedEvent extends DomainEvent {
  readonly aggregateType = 'workflow_execution'
  readonly eventName = 'workflow.step.completed'

  constructor(
    readonly aggregateId: string,
    readonly stepId: string,
    readonly status: string,
    readonly outputData?: Record<string, unknown> | null,
  ) {
    super()
  }

  toPrimitives() {
    return {
      executionId: this.aggregateId,
      stepId: this.stepId,
      status: this.status,
      outputData: this.outputData,
    }
  }
}

export class WorkflowExecutionCompletedEvent extends DomainEvent {
  readonly aggregateType = 'workflow_execution'
  readonly eventName = 'workflow.execution.completed'

  constructor(readonly aggregateId: string, readonly workflowId: string) {
    super()
  }

  toPrimitives() {
    return {
      executionId: this.aggregateId,
      workflowId: this.workflowId,
    }
  }
}

export class WorkflowExecutionCancelledEvent extends DomainEvent {
  readonly aggregateType = 'workflow_execution'
  readonly eventName = 'workflow.execution.cancelled'

  constructor(readonly aggregateId: string, readonly reason: string) {
    super()
  }

  toPrimitives() {
    return {
      executionId: this.aggregateId,
      reason: this.reason,
    }
  }
}

export class WorkflowExecutionFailedEvent extends DomainEvent {
  readonly aggregateType = 'workflow_execution'
  readonly eventName = 'workflow.execution.failed'

  constructor(readonly aggregateId: string, readonly workflowId: string, readonly reason: string) {
    super()
  }

  toPrimitives() {
    return {
      executionId: this.aggregateId,
      workflowId: this.workflowId,
      reason: this.reason,
    }
  }
}
