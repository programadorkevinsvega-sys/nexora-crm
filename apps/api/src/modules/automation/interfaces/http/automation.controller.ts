import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common'
import {
  CreateWorkflowHandler,
  ActivateWorkflowHandler,
  PauseWorkflowHandler,
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

@Controller('automation')
export class AutomationController {
  constructor(
    private readonly createWorkflowHandler: CreateWorkflowHandler,
    private readonly activateWorkflowHandler: ActivateWorkflowHandler,
    private readonly pauseWorkflowHandler: PauseWorkflowHandler,
    private readonly cancelExecutionHandler: CancelExecutionHandler,
    private readonly getWorkflowHandler: GetWorkflowHandler,
    private readonly listWorkflowsHandler: ListWorkflowsHandler,
    private readonly getExecutionHandler: GetWorkflowExecutionHandler,
    private readonly listExecutionsHandler: ListWorkflowExecutionsHandler,
  ) {}

  @Post('workflows')
  async create(
    @Body() dto: { name: string; triggerEvent: string; stepsGraph: WorkflowStep[]; description?: string; triggerFilter?: Record<string, unknown> },
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const result = await this.createWorkflowHandler.execute(
      new CreateWorkflowCommand(
        tenantId,
        dto.name,
        dto.triggerEvent,
        dto.stepsGraph,
        dto.description,
        dto.triggerFilter,
      ),
    )
    const def = await this.getWorkflowHandler.execute(
      new GetWorkflowQuery(tenantId, result.id),
    )
    return WorkflowMapper.definitionToResponse(def)
  }

  @Get('workflows')
  async list(
    @Headers('X-Tenant-Id') tenantId: string,
    @Query('status') status?: string,
  ) {
    const list = await this.listWorkflowsHandler.execute(
      new ListWorkflowsQuery(tenantId, status),
    )
    return list.map(WorkflowMapper.definitionToResponse)
  }

  @Get('workflows/:id')
  async getById(
    @Param('id') id: string,
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const def = await this.getWorkflowHandler.execute(
      new GetWorkflowQuery(tenantId, id),
    )
    return WorkflowMapper.definitionToResponse(def)
  }

  @Post('workflows/:id/activate')
  async activate(
    @Param('id') id: string,
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    await this.activateWorkflowHandler.execute(
      new ActivateWorkflowCommand(tenantId, id),
    )
    const def = await this.getWorkflowHandler.execute(
      new GetWorkflowQuery(tenantId, id),
    )
    return WorkflowMapper.definitionToResponse(def)
  }

  @Post('workflows/:id/pause')
  async pause(
    @Param('id') id: string,
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    await this.pauseWorkflowHandler.execute(
      new PauseWorkflowCommand(tenantId, id),
    )
    const def = await this.getWorkflowHandler.execute(
      new GetWorkflowQuery(tenantId, id),
    )
    return WorkflowMapper.definitionToResponse(def)
  }

  @Get('executions')
  async listExecutions(
    @Headers('X-Tenant-Id') tenantId: string,
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: string,
  ) {
    const list = await this.listExecutionsHandler.execute(
      new ListWorkflowExecutionsQuery(tenantId, { workflowId, status }),
    )
    return list.map(WorkflowMapper.executionToResponse)
  }

  @Get('executions/:id')
  async getExecution(
    @Param('id') id: string,
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const res = await this.getExecutionHandler.execute(
      new GetWorkflowExecutionQuery(tenantId, id),
    )
    return {
      execution: WorkflowMapper.executionToResponse(res.execution),
      steps: res.steps,
    }
  }

  @Post('executions/:id/cancel')
  async cancelExecution(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    await this.cancelExecutionHandler.execute(
      new CancelExecutionCommand(tenantId, id, body.reason),
    )
    return { success: true }
  }
}
