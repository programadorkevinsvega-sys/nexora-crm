import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateWorkflowHandler,
  ActivateWorkflowHandler,
  PauseWorkflowHandler,
  CreateWorkflowVersionHandler,
  TriggerEventHandler,
  CancelExecutionHandler,
} from '../../application/commands/workflow.handlers'
import {
  GetWorkflowHandler,
  ListWorkflowsHandler,
  GetWorkflowExecutionHandler,
  ListWorkflowExecutionsHandler,
} from '../../application/queries/workflow.handlers'
import {
  CreateWorkflowCommand,
  ActivateWorkflowCommand,
  PauseWorkflowCommand,
  CreateWorkflowVersionCommand,
  TriggerEventCommand,
  CancelExecutionCommand,
} from '../../application/commands/workflow.commands'
import {
  GetWorkflowQuery,
  ListWorkflowsQuery,
  GetWorkflowExecutionQuery,
  ListWorkflowExecutionsQuery,
} from '../../application/queries/workflow.queries'
import { WorkflowMapper } from '../../infrastructure/workflow.mapper'
import { WorkflowStep } from '@crm/contracts'

@Controller()
export class AutomationGrpcController {
  constructor(
    private readonly createWorkflowHandler: CreateWorkflowHandler,
    private readonly activateWorkflowHandler: ActivateWorkflowHandler,
    private readonly pauseWorkflowHandler: PauseWorkflowHandler,
    private readonly createVersionHandler: CreateWorkflowVersionHandler,
    private readonly triggerEventHandler: TriggerEventHandler,
    private readonly cancelExecutionHandler: CancelExecutionHandler,
    private readonly getWorkflowHandler: GetWorkflowHandler,
    private readonly listWorkflowsHandler: ListWorkflowsHandler,
    private readonly getExecutionHandler: GetWorkflowExecutionHandler,
    private readonly listExecutionsHandler: ListWorkflowExecutionsHandler,
  ) {}

  @GrpcMethod('AutomationService', 'CreateWorkflow')
  async createWorkflow(data: {
    tenantId: string
    name: string
    description?: string
    triggerEvent: string
    triggerFilterJson?: string
    stepsGraphJson: string
  }) {
    const triggerFilter = data.triggerFilterJson ? JSON.parse(data.triggerFilterJson) : undefined
    const stepsGraph = JSON.parse(data.stepsGraphJson) as WorkflowStep[]
    const result = await this.createWorkflowHandler.execute(
      new CreateWorkflowCommand(
        data.tenantId,
        data.name,
        data.triggerEvent,
        stepsGraph,
        data.description,
        triggerFilter,
      ),
    )
    const def = await this.getWorkflowHandler.execute(
      new GetWorkflowQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(WorkflowMapper.definitionToResponse(def)) }
  }

  @GrpcMethod('AutomationService', 'GetWorkflow')
  async getWorkflow(data: { tenantId: string; id: string }) {
    const def = await this.getWorkflowHandler.execute(
      new GetWorkflowQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(WorkflowMapper.definitionToResponse(def)) }
  }

  @GrpcMethod('AutomationService', 'ListWorkflows')
  async listWorkflows(data: { tenantId: string; status?: string }) {
    const list = await this.listWorkflowsHandler.execute(
      new ListWorkflowsQuery(data.tenantId, data.status),
    )
    return {
      jsonItems: list.map((item) => JSON.stringify(WorkflowMapper.definitionToResponse(item))),
    }
  }

  @GrpcMethod('AutomationService', 'ActivateWorkflow')
  async activateWorkflow(data: { tenantId: string; id: string }) {
    await this.activateWorkflowHandler.execute(
      new ActivateWorkflowCommand(data.tenantId, data.id),
    )
    const def = await this.getWorkflowHandler.execute(
      new GetWorkflowQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(WorkflowMapper.definitionToResponse(def)) }
  }

  @GrpcMethod('AutomationService', 'PauseWorkflow')
  async pauseWorkflow(data: { tenantId: string; id: string }) {
    await this.pauseWorkflowHandler.execute(
      new PauseWorkflowCommand(data.tenantId, data.id),
    )
    const def = await this.getWorkflowHandler.execute(
      new GetWorkflowQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(WorkflowMapper.definitionToResponse(def)) }
  }

  @GrpcMethod('AutomationService', 'TriggerEvent')
  async triggerEvent(data: {
    tenantId: string
    eventName: string
    entityType: string
    entityId: string
    payloadJson: string
  }) {
    const payload = JSON.parse(data.payloadJson || '{}')
    const res = await this.triggerEventHandler.execute(
      new TriggerEventCommand(
        data.tenantId,
        data.eventName,
        data.entityType,
        data.entityId,
        payload,
      ),
    )
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('AutomationService', 'GetWorkflowExecution')
  async getWorkflowExecution(data: { tenantId: string; executionId: string }) {
    const res = await this.getExecutionHandler.execute(
      new GetWorkflowExecutionQuery(data.tenantId, data.executionId),
    )
    return {
      json: JSON.stringify(WorkflowMapper.executionToResponse(res.execution)),
      stepsJson: res.steps.map((s) => JSON.stringify(s)),
    }
  }

  @GrpcMethod('AutomationService', 'ListWorkflowExecutions')
  async listWorkflowExecutions(data: {
    tenantId: string
    workflowId?: string
    status?: string
  }) {
    const list = await this.listExecutionsHandler.execute(
      new ListWorkflowExecutionsQuery(data.tenantId, {
        workflowId: data.workflowId,
        status: data.status,
      }),
    )
    return {
      jsonItems: list.map((item) => JSON.stringify(WorkflowMapper.executionToResponse(item))),
    }
  }

  @GrpcMethod('AutomationService', 'CancelExecution')
  async cancelExecution(data: { tenantId: string; executionId: string; reason?: string }) {
    await this.cancelExecutionHandler.execute(
      new CancelExecutionCommand(data.tenantId, data.executionId, data.reason),
    )
    return { success: true }
  }
}
