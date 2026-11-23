import { WorkflowDefinition } from '../domain/entities/workflow-definition.entity'
import { WorkflowExecution } from '../domain/entities/workflow-execution.entity'
import { WorkflowStepExecution } from '../domain/entities/workflow-step-execution.entity'
import { WorkflowStatus, WorkflowExecutionStatus, WorkflowStepStatus, WorkflowStep } from '@crm/contracts'

export class WorkflowMapper {
  static definitionToDomain(row: any): WorkflowDefinition {
    const rawSteps = row.stepsGraph
    const stepsGraph: WorkflowStep[] = Array.isArray(rawSteps)
      ? rawSteps
      : Array.isArray(rawSteps?.nodes)
        ? rawSteps.nodes
        : Array.isArray(rawSteps?.steps)
          ? rawSteps.steps
          : []

    return new WorkflowDefinition(
      row.id,
      row.tenantId,
      row.name,
      row.description ?? null,
      row.version,
      row.status as WorkflowStatus,
      row.triggerEvent,
      row.triggerFilter ?? null,
      stepsGraph,
      new Date(row.createdAt),
      new Date(row.updatedAt),
    )
  }

  static executionToDomain(row: any): WorkflowExecution {
    return new WorkflowExecution(
      row.id,
      row.tenantId,
      row.workflowId,
      row.version,
      row.entityType,
      row.entityId,
      row.status as WorkflowExecutionStatus,
      row.currentStepId,
      row.contextData ?? null,
      new Date(row.startedAt),
      row.completedAt ? new Date(row.completedAt) : null,
      row.cancelledAt ? new Date(row.cancelledAt) : null,
      row.errorMessage ?? null,
      row.resumeAt ? new Date(row.resumeAt) : null,
    )
  }

  static stepExecutionToDomain(row: any): WorkflowStepExecution {
    return WorkflowStepExecution.rehydrate({
      id: row.id,
      tenantId: row.tenantId,
      executionId: row.executionId,
      stepId: row.stepId,
      idempotencyKey: row.idempotencyKey,
      status: row.status as WorkflowStepStatus,
      attempts: row.attempts,
      outputData: row.outputData ?? null,
      errorMessage: row.errorMessage ?? null,
      startedAt: new Date(row.startedAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
    })
  }

  static definitionToResponse(def: WorkflowDefinition) {
    return {
      id: def.id,
      tenantId: def.tenantId,
      name: def.name,
      description: def.description,
      version: def.version,
      status: def.status,
      triggerEvent: def.triggerEvent,
      triggerFilter: def.triggerFilter,
      stepsGraph: def.stepsGraph,
      createdAt: def.createdAt.toISOString(),
      updatedAt: def.updatedAt.toISOString(),
    }
  }

  static executionToResponse(exec: WorkflowExecution) {
    return {
      id: exec.id,
      tenantId: exec.tenantId,
      workflowId: exec.workflowId,
      version: exec.version,
      entityType: exec.entityType,
      entityId: exec.entityId,
      status: exec.status,
      currentStepId: exec.currentStepId,
      contextData: exec.contextData,
      startedAt: exec.startedAt.toISOString(),
      completedAt: exec.completedAt?.toISOString() ?? null,
      cancelledAt: exec.cancelledAt?.toISOString() ?? null,
      errorMessage: exec.errorMessage,
      resumeAt: exec.resumeAt?.toISOString() ?? null,
    }
  }
}
