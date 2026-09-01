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
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { AutomationBffService } from './automation.bff.service'
import { CreateWorkflowSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import type { CreateWorkflow, WorkflowDefinition, WorkflowExecution } from '@crm/contracts'

@ApiTags('Automatización & Workflows (Automation)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/automation')
export class AutomationBffController {
  constructor(private readonly service: AutomationBffService) {}

  @Post('workflows')
  @ApiOperation({ summary: 'Crear un nuevo flujo de automatización (Workflow)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'triggerEvent', 'nodes', 'edges'],
      properties: {
        name: { type: 'string', example: 'Bienvenida a nuevo contacto y asignación' },
        triggerEvent: { type: 'string', example: 'contact.created' },
        nodes: {
          type: 'array',
          items: { type: 'object' },
          example: [{ id: '1', type: 'ACTION', actionType: 'SEND_EMAIL' }],
        },
        edges: {
          type: 'array',
          items: { type: 'object' },
          example: [{ from: '1', to: '2' }],
        },
      },
    },
  })
  async create(
    @Body(createZodPipe(CreateWorkflowSchema)) dto: CreateWorkflow,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowDefinition> {
    return this.service.createWorkflow(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('workflows')
  @ApiOperation({ summary: 'Listar flujos de trabajo con filtro de estado' })
  @ApiQuery({ name: 'status', required: false, description: 'DRAFT, ACTIVE, PAUSED' })
  async list(
    @Query('status') status?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowDefinition[]> {
    return this.service.listWorkflows(tenantId || '00000000-0000-0000-0000-000000000001', status)
  }

  @Get('workflows/:id')
  @ApiOperation({ summary: 'Obtener flujo de trabajo por ID' })
  @ApiParam({ name: 'id', description: 'UUID del workflow' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowDefinition> {
    return this.service.getWorkflow(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('workflows/:id/activate')
  @ApiOperation({ summary: 'Activar un flujo de trabajo' })
  @ApiParam({ name: 'id', description: 'UUID del workflow' })
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowDefinition> {
    return this.service.activateWorkflow(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('workflows/:id/pause')
  @ApiOperation({ summary: 'Pausar un flujo de trabajo' })
  @ApiParam({ name: 'id', description: 'UUID del workflow' })
  async pause(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowDefinition> {
    return this.service.pauseWorkflow(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('trigger')
  @ApiOperation({ summary: 'Disparar manualmente un evento para evaluar flujos de trabajo' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['eventName', 'entityType', 'entityId'],
      properties: {
        eventName: { type: 'string', example: 'contact.created' },
        entityType: { type: 'string', example: 'Contact' },
        entityId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        payload: { type: 'object', example: { email: 'juan@empresa.com' } },
      },
    },
  })
  async trigger(
    @Body() body: { eventName: string; entityType: string; entityId: string; payload: Record<string, unknown> },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ triggeredCount: number }> {
    return this.service.triggerEvent(body, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('executions')
  @ApiOperation({ summary: 'Listar historial de ejecuciones de workflows' })
  @ApiQuery({ name: 'workflowId', required: false, description: 'UUID del workflow' })
  @ApiQuery({ name: 'status', required: false, description: 'COMPLETED, FAILED, RUNNING' })
  async listExecutions(
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WorkflowExecution[]> {
    return this.service.listExecutions(tenantId || '00000000-0000-0000-0000-000000000001', workflowId, status)
  }

  @Get('executions/:id')
  @ApiOperation({ summary: 'Obtener detalle y pasos de una ejecución' })
  @ApiParam({ name: 'id', description: 'UUID de la ejecución' })
  async getExecution(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ execution: WorkflowExecution; steps: any[] }> {
    return this.service.getExecution(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
