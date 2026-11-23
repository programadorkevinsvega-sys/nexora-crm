import {
  Controller, Get, Post, Put, Delete, Param, Query, Body, Headers, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiHeader } from '@nestjs/swagger'
import { z } from 'zod'
import { CreateSalesTeamSchema, CreateQuotaSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { SalesTeamsBffService, SalesTeamFilters, PaginatedResult } from './sales-teams.bff.service'
import type { CreateSalesTeam, SalesTeam, CreateQuota, SalesQuota } from '@crm/contracts'

const AddMemberBodySchema = z.object({ userId: z.string().uuid() })

@ApiTags('Equipos Comerciales & Metas (Sales Teams & Quotas)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api')
export class SalesTeamsBffController {
  constructor(private readonly service: SalesTeamsBffService) {}

  @Get('sales-teams')
  @ApiOperation({ summary: 'Listar equipos comerciales' })
  async list(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<SalesTeam>> {
    const filters: SalesTeamFilters = { cursor, limit: limit ? Number(limit) : undefined, search }
    return this.service.list(filters, tenantId!)
  }

  @Post('sales-teams')
  @ApiOperation({ summary: 'Crear un equipo comercial' })
  @ApiBody({ schema: { type: 'object', required: ['name'], properties: {
    name: { type: 'string', example: 'Equipo Comercial LatAm' },
    description: { type: 'string', example: 'Fuerza de ventas para Colombia, México y Perú' },
    managerUserId: { type: 'string', example: '00000000-0000-0000-0000-000000000002' },
  } } })
  async create(
    @Body(createZodPipe(CreateSalesTeamSchema)) dto: CreateSalesTeam,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SalesTeam> {
    return this.service.create(dto, tenantId!)
  }

  @Get('sales-teams/:id')
  @ApiOperation({ summary: 'Obtener equipo por ID' })
  @ApiParam({ name: 'id', description: 'UUID del equipo' })
  async getById(@Param('id', ParseUUIDPipe) id: string, @Headers('X-Tenant-Id') tenantId?: string): Promise<SalesTeam> {
    return this.service.getById(id, tenantId!)
  }

  @Put('sales-teams/:id')
  @ApiOperation({ summary: 'Actualizar datos de un equipo' })
  @ApiParam({ name: 'id', description: 'UUID del equipo' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateSalesTeam>,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SalesTeam> {
    return this.service.update(id, dto, tenantId!)
  }

  @Delete('sales-teams/:id')
  @ApiOperation({ summary: 'Eliminar un equipo' })
  @ApiParam({ name: 'id', description: 'UUID del equipo' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @Headers('X-Tenant-Id') tenantId?: string): Promise<void> {
    return this.service.delete(id, tenantId!)
  }

  @Post('sales-teams/:id/members')
  @ApiOperation({ summary: 'Asignar vendedor a un equipo comercial' })
  @ApiParam({ name: 'id', description: 'UUID del equipo' })
  @ApiBody({ schema: { type: 'object', required: ['userId'], properties: {
    userId: { type: 'string', example: '00000000-0000-0000-0000-000000000002' },
  } } })
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(AddMemberBodySchema)) dto: { userId: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.addMember(id, dto.userId, tenantId!)
  }

  @Delete('sales-teams/:id/members/:userId')
  @ApiOperation({ summary: 'Remover vendedor del equipo' })
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.removeMember(id, userId, tenantId!)
  }

  @Get('sales-teams/:id/members')
  @ApiOperation({ summary: 'Listar miembros de un equipo comercial' })
  async listMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<unknown[]> {
    return this.service.listMembers(id, tenantId!)
  }

  @Post('sales-teams/:id/quotas')
  @ApiOperation({ summary: 'Asignar cuota/meta de ventas mensual o trimestral' })
  @ApiParam({ name: 'id', description: 'UUID del equipo' })
  @ApiBody({ schema: { type: 'object', required: ['targetAmount', 'periodMonth', 'periodYear'], properties: {
    targetAmount: { type: 'number', example: 50000 },
    periodMonth: { type: 'number', example: 10 },
    periodYear: { type: 'number', example: 2026 },
    userId: { type: 'string', example: '00000000-0000-0000-0000-000000000002' },
  } } })
  async createQuota(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(CreateQuotaSchema)) dto: CreateQuota,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SalesQuota> {
    return this.service.createQuota(id, dto, tenantId!)
  }

  @Get('sales-teams/:id/quotas')
  @ApiOperation({ summary: 'Listar metas y cumplimiento de ventas del equipo' })
  async listQuotas(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('periodMonth') periodMonth?: string,
    @Query('periodYear') periodYear?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<SalesQuota>> {
    return this.service.listQuotas(id, {
      cursor, limit: limit ? Number(limit) : undefined,
      periodMonth: periodMonth ? Number(periodMonth) : undefined,
      periodYear: periodYear ? Number(periodYear) : undefined,
    }, tenantId!)
  }
}