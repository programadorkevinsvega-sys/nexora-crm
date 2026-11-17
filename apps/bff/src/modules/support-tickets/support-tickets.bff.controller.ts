import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { z } from 'zod'
import { CreateTicketSchema, UpdateTicketStatusSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { SupportTicketsBffService, TicketFilters, PaginatedResult } from './support-tickets.bff.service'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import type { CreateTicket, SupportTicket, TicketReply } from '@crm/contracts'

const AssignTicketBodySchema = z.object({
  assignedUserId: z.string().uuid(),
})

@ApiTags('Tickets & Soporte (Support Tickets)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api')
export class SupportTicketsBffController {
  constructor(private readonly service: SupportTicketsBffService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'Listar tickets de soporte con filtros de estado y prioridad' })
  @ApiQuery({ name: 'status', required: false, description: 'Estado: OPEN, IN_PROGRESS, RESOLVED, CLOSED' })
  @ApiQuery({ name: 'priority', required: false, description: 'Prioridad: LOW, NORMAL, HIGH, URGENT' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de registros' })
  async list(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('contactId') contactId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<SupportTicket>> {
    const filters: TicketFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      status,
      priority,
      assignedUserId,
      contactId,
    }
    return this.service.list(filters, tenantId!)
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Crear un nuevo ticket de soporte' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['subject', 'contactId'],
      properties: {
        subject: { type: 'string', example: 'Error al generar factura electrónica' },
        description: { type: 'string', example: 'El cliente reporta timeout en el módulo de pagos' },
        priority: { type: 'string', example: 'HIGH' },
        contactId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
      },
    },
  })
  async create(
    @Body(createZodPipe(CreateTicketSchema)) dto: CreateTicket,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SupportTicket> {
    return this.service.create(dto, tenantId!)
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Obtener un ticket por ID' })
  @ApiParam({ name: 'id', description: 'UUID del ticket' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SupportTicket> {
    return this.service.getById(id, tenantId!)
  }

  @Put('tickets/:id')
  @ApiOperation({ summary: 'Actualizar un ticket de soporte' })
  @ApiParam({ name: 'id', description: 'UUID del ticket' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'IN_PROGRESS' },
        priority: { type: 'string', example: 'URGENT' },
        assignedUserId: { type: 'string', example: '00000000-0000-0000-0000-000000000002' },
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status?: string; assignedUserId?: string; subject?: string; description?: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SupportTicket> {
    if (dto.status) {
      await this.service.updateStatus(id, dto.status, tenantId!)
    }
    if (dto.assignedUserId) {
      await this.service.assign(id, dto.assignedUserId, tenantId!)
    }
    return this.service.getById(id, tenantId!)
  }

  @Patch('tickets/:id/status')
  @ApiOperation({ summary: 'Actualizar exclusivamente el estado del ticket' })
  @ApiParam({ name: 'id', description: 'UUID del ticket' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', example: 'RESOLVED' },
      },
    },
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateTicketStatusSchema)) dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SupportTicket> {
    return this.service.updateStatus(id, dto.status, tenantId!)
  }

  @Post('tickets/:id/replies')
  @ApiOperation({ summary: 'Agregar una respuesta o nota interna al ticket' })
  @ApiParam({ name: 'id', description: 'UUID del ticket' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['message'],
      properties: {
        message: { type: 'string', example: 'Se ha revisado el caso y se procedió a reintentar la transacción con éxito.' },
        authorType: { type: 'string', example: 'AGENT' },
        isInternalNote: { type: 'boolean', example: false },
      },
    },
  })
  async addReply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
    @CurrentUser() user?: AuthenticatedUser,
    @Headers('X-Tenant-Id') headerTenantId?: string,
  ): Promise<TicketReply> {
    const tenantId = user?.tenantId || headerTenantId
    const authorId = user?.userId || body.authorId || '00000000-0000-0000-0000-000000000002'
    const authorType = body.authorType || 'AGENT'
    return this.service.addReply(
      id,
      {
        message: body.message,
        authorType,
        authorId,
        isInternalNote: Boolean(body.isInternalNote),
      },
      tenantId!,
    )
  }

  @Get('tickets/:id/replies')
  @ApiOperation({ summary: 'Obtener el hilo de respuestas de un ticket' })
  @ApiParam({ name: 'id', description: 'UUID del ticket' })
  async listReplies(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ data: TicketReply[]; nextCursor: null }> {
    const replies = await this.service.listReplies(id, tenantId!)
    return { data: replies, nextCursor: null }
  }
}
