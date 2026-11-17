import { WorkflowDefinition } from '../entities/workflow-definition.entity'

export abstract class WorkflowDefinitionRepository {
  abstract save(definition: WorkflowDefinition): Promise<void>
  abstract findById(tenantId: string, id: string): Promise<WorkflowDefinition | null>
  abstract findActiveByTrigger(tenantId: string, triggerEvent: string): Promise<WorkflowDefinition[]>
  abstract list(tenantId: string, filters?: { status?: string }): Promise<WorkflowDefinition[]>
  abstract delete(tenantId: string, id: string): Promise<void>
}
