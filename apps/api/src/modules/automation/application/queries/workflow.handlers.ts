import { Injectable } from '@nestjs/common'
import {
  GetWorkflowQuery,
  ListWorkflowsQuery,
  GetWorkflowExecutionQuery,
  ListWorkflowExecutionsQuery,
} from './workflow.queries'
import { WorkflowDefinitionRepository } from '../../domain/repositories/workflow-definition.repository'
import { WorkflowExecutionRepository } from '../../domain/repositories/workflow-execution.repository'
import { WorkflowDefinition } from '../../domain/entities/workflow-definition.entity'
import { WorkflowExecution } from '../../domain/entities/workflow-execution.entity'
import { WorkflowStepExecution } from '../../domain/entities/workflow-step-execution.entity'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class GetWorkflowHandler {
  constructor(private readonly repo: WorkflowDefinitionRepository) {}

  async execute(query: GetWorkflowQuery): Promise<WorkflowDefinition> {
    const workflow = await this.repo.findById(query.tenantId, query.id)
    if (!workflow) throw new NotFoundError('WorkflowDefinition', query.id)
    return workflow
  }
}

@Injectable()
export class ListWorkflowsHandler {
  constructor(private readonly repo: WorkflowDefinitionRepository) {}

  async execute(query: ListWorkflowsQuery): Promise<WorkflowDefinition[]> {
    return this.repo.list(query.tenantId, { status: query.status })
  }
}

@Injectable()
export class GetWorkflowExecutionHandler {
  constructor(private readonly repo: WorkflowExecutionRepository) {}

  async execute(
    query: GetWorkflowExecutionQuery,
  ): Promise<{ execution: WorkflowExecution; steps: WorkflowStepExecution[] }> {
    const execution = await this.repo.findById(query.tenantId, query.executionId)
    if (!execution) throw new NotFoundError('WorkflowExecution', query.executionId)

    const steps = await this.repo.listStepExecutions(query.tenantId, query.executionId)
    return { execution, steps }
  }
}

@Injectable()
export class ListWorkflowExecutionsHandler {
  constructor(private readonly repo: WorkflowExecutionRepository) {}

  async execute(query: ListWorkflowExecutionsQuery): Promise<WorkflowExecution[]> {
    return this.repo.listExecutions(query.tenantId, query.filters)
  }
}
