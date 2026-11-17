import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { CreateTaskSchema, UpdateTaskSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { InteractionsBffService, TaskFilters, PaginatedResult } from './interactions.bff.service'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import type { CreateTask, UpdateTask, Task } from '@crm/contracts'

@ApiTags('Interacciones: Tareas (Tasks)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/tasks')
export class TasksBffController {
  constructor(private readonly service: InteractionsBffService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tareas y pendientes con filtros' })
  @ApiQuery({ name: 'isCompleted', required: false, description: 'Filtrar completadas: true/false' })
  @ApiQuery({ name: 'contactId', required: false, description: 'UUID del contacto vinculado' })
  async listTasks(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('isCompleted') isCompleted?: string,
    @Query('contactId') contactId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Task>> {
    const filters: TaskFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      assignedUserId,
      isCompleted: isCompleted !== undefined ? isCompleted === 'true' : undefined,
      contactId,
    }
    return this.service.listTasks(filters, tenantId!)
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'dueDate'],
      properties: {
        title: { type: 'string', example: 'Llamar al cliente para seguimiento de cotización' },
        description: { type: 'string', example: 'Preguntar si tienen dudas con el alcance técnico' },
        dueDate: { type: 'string', example: '2026-10-15T15:00:00Z' },
        priority: { type: 'string', example: 'HIGH' },
        contactId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
      },
    },
  })
  async createTask(
    @Body(createZodPipe(CreateTaskSchema)) dto: CreateTask,
    @CurrentUser() user?: AuthenticatedUser,
    @Headers('X-Tenant-Id') headerTenantId?: string,
  ): Promise<Task> {
    const tenantId = user?.tenantId || headerTenantId
    const assignedUserId = user?.userId || dto.assignedUserId || '00000000-0000-0000-0000-000000000002'
    let dueDate = dto.dueDate
    if (dueDate && !dueDate.includes('T')) {
      dueDate = new Date(dueDate).toISOString()
    }
    return this.service.createTask({ ...dto, dueDate, assignedUserId }, tenantId!)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tarea por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la tarea' })
  async getTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Task> {
    return this.service.getTask(id, tenantId!)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar o completar una tarea' })
  @ApiParam({ name: 'id', description: 'UUID de la tarea' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Llamada completada con éxito' },
        isCompleted: { type: 'boolean', example: true },
      },
    },
  })
  async updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateTaskSchema)) dto: UpdateTask,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Task> {
    return this.service.updateTask(id, dto, tenantId!)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiParam({ name: 'id', description: 'UUID de la tarea' })
  async deleteTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.deleteTask(id, tenantId!)
  }
}
