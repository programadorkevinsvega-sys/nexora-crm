import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { AutomationBffService } from './automation.bff.service'
import { CreateWorkflowSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import type { CreateWorkflow, WorkflowDefinition, WorkflowExecution } from '@crm/contracts'

@Controller('api/automation')
export class AutomationBffController {
  constructor(private readonly service: AutomationBffService) {}

  @Post('workflows')
  async create(
    @Body(createZodPipe(CreateWorkflowSchema)) dto: CreateWorkflow,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowDefinition> {
    return this.service.createWorkflow(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('workflows')
  async list(
    @Query('status') status?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowDefinition[]> {
    return this.service.listWorkflows(tenantId || '00000000-0000-0000-0000-000000000001', status)
  }

  @Get('workflows/:id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowDefinition> {
    return this.service.getWorkflow(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('workflows/:id/activate')
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowDefinition> {
    return this.service.activateWorkflow(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('workflows/:id/pause')
  async pause(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowDefinition> {
    return this.service.pauseWorkflow(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('trigger')
  async trigger(
    @Body() body: { eventName: string; entityType: string; entityId: string; payload: Record<string, unknown> },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ triggeredCount: number }> {
    return this.service.triggerEvent(body, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('executions')
  async listExecutions(
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowExecution[]> {
    return this.service.listExecutions(tenantId!, workflowId, status)
  }

  @Get('executions/:id')
  async getExecution(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ execution: WorkflowExecution; steps: any[] }> {
    return this.service.getExecution(id, tenantId!)
  }

  @Post('executions/:id/cancel')
  async cancelExecution(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: boolean }> {
    await this.service.cancelExecution(id, body?.reason, tenantId!)
    return { success: true }
  }
}
