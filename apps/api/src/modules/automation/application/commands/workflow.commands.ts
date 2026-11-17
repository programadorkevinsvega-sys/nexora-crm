import { WorkflowStep } from '@crm/contracts'

export class CreateWorkflowCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly triggerEvent: string,
    readonly stepsGraph: WorkflowStep[],
    readonly description?: string,
    readonly triggerFilter?: Record<string, unknown>,
  ) {}
}

export class ActivateWorkflowCommand {
  constructor(readonly tenantId: string, readonly workflowId: string) {}
}

export class PauseWorkflowCommand {
  constructor(readonly tenantId: string, readonly workflowId: string) {}
}

export class CreateWorkflowVersionCommand {
  constructor(
    readonly tenantId: string,
    readonly workflowId: string,
    readonly overrides?: {
      name?: string
      description?: string
      triggerEvent?: string
      triggerFilter?: Record<string, unknown>
      stepsGraph?: WorkflowStep[]
    },
  ) {}
}

export class TriggerEventCommand {
  constructor(
    readonly tenantId: string,
    readonly eventName: string,
    readonly entityType: string,
    readonly entityId: string,
    readonly payload: Record<string, unknown>,
  ) {}
}

export class CancelExecutionCommand {
  constructor(
    readonly tenantId: string,
    readonly executionId: string,
    readonly reason?: string,
  ) {}
}
