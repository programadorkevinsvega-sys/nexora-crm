import { WorkflowDefinition } from '../domain/entities/workflow-definition.entity'
import { WorkflowExecution } from '../domain/entities/workflow-execution.entity'
import { WorkflowStepExecution } from '../domain/entities/workflow-step-execution.entity'
import {
  WorkflowStatusSchema,
  WorkflowExecutionStatusSchema,
  WorkflowStepStatusSchema,
  WorkflowStepSchema,
} from '@crm/contracts'
import type { WorkflowStep } from '@crm/contracts'
import type { workflowDefinitions, workflowExecutions, workflowStepExecutions } from '@crm/database'

type WorkflowDefinitionRow = typeof workflowDefinitions.$inferSelect
type WorkflowExecutionRow = typeof workflowExecutions.$inferSelect
type WorkflowStepExecutionRow = typeof workflowStepExecutions.$inferSelect

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseWorkflowSteps(value: unknown): WorkflowStep[] {
  let source = value
  if (isRecord(source)) source = Array.isArray(source.nodes) ? source.nodes : source.steps
  const parsed = WorkflowStepSchema.array().safeParse(source)
  if (!parsed.success) throw new TypeError('Persisted workflow steps do not match the workflow step contract')
  return parsed.data
}

function parseOptionalRecord(value: unknown, field: string): Record<string, unknown> | null {
  if (value === null || value === undefined) return null
  if (!isRecord(value)) throw new TypeError(`Persisted workflow ${field} must be an object`)
  return value
}

export class WorkflowMapper {
  static definitionToDomain(row: WorkflowDefinitionRow): WorkflowDefinition {
    return new WorkflowDefinition(
      row.id,
      row.tenantId,
      row.name,
      row.description ?? null,
      row.version,
      WorkflowStatusSchema.parse(row.status),
      row.triggerEvent,
      parseOptionalRecord(row.triggerFilter, 'triggerFilter'),
      parseWorkflowSteps(row.stepsGraph),
      row.createdAt,
      row.updatedAt,
    )
  }

  static executionToDomain(row: WorkflowExecutionRow): WorkflowExecution {
    return new WorkflowExecution(
      row.id,
      row.tenantId,
      row.workflowId,
      row.version,
      row.entityType,
      row.entityId,
      WorkflowExecutionStatusSchema.parse(row.status),
      row.currentStepId,
      parseOptionalRecord(row.contextData, 'contextData'),
      row.startedAt,
      row.completedAt,
      row.cancelledAt,
      row.errorMessage ?? null,
      row.resumeAt,
      row.resumeToken ?? null,
    )
  }

  static stepExecutionToDomain(row: WorkflowStepExecutionRow): WorkflowStepExecution {
    return WorkflowStepExecution.rehydrate({
      id: row.id,
      tenantId: row.tenantId,
      executionId: row.executionId,
      stepId: row.stepId,
      idempotencyKey: row.idempotencyKey,
      status: WorkflowStepStatusSchema.parse(row.status),
      attempts: row.attempts,
      outputData: parseOptionalRecord(row.outputData, 'step outputData'),
      errorMessage: row.errorMessage ?? null,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
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
      resumeAt: exec.resumeAt?.toISOString() ?? null,
      errorMessage: exec.errorMessage,
    }
  }
}
