import { WorkflowExecution } from '../entities/workflow-execution.entity'
import { WorkflowStepExecution } from '../entities/workflow-step-execution.entity'

export abstract class WorkflowExecutionRepository {
  abstract save(execution: WorkflowExecution): Promise<void>
  abstract findById(tenantId: string, id: string): Promise<WorkflowExecution | null>
  abstract findRunningByEntity(tenantId: string, entityType: string, entityId: string): Promise<WorkflowExecution[]>
  abstract listExecutions(tenantId: string, filters?: { workflowId?: string; status?: string }): Promise<WorkflowExecution[]>
  
  abstract saveStepExecution(step: WorkflowStepExecution): Promise<void>
  abstract findStepExecutionByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<WorkflowStepExecution | null>
  abstract listStepExecutions(tenantId: string, executionId: string): Promise<WorkflowStepExecution[]>
}
