import {
  Controller, Get, Post, Put, Delete, Param, Query, Body, Headers, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import {
  CreatePipelineSchema, CreateDealSchema, UpdateDealSchema, MoveDealSchema,
  WinDealSchema, LoseDealSchema, DealFilterSchema,
} from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { PipelinesBffService, PaginatedResult } from './pipelines.bff.service'
import type { Pipeline, CreatePipeline, PipelineBoard, Deal, CreateDeal, UpdateDeal, DealFilter } from '@crm/contracts'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Pipelines & Oportunidades (Deals)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/pipelines')
export class PipelinesBffController {
  constructor(private readonly service: PipelinesBffService) {}

  @Get('deals')
  @ApiOperation({ summary: 'Listar oportunidades de venta (Deals) con filtros' })
  @ApiQuery({ name: 'pipelineId', required: false, description: 'Filtrar por UUID de pipeline' })
  @ApiQuery({ name: 'stageId', required: false, description: 'Filtrar por UUID de etapa' })
  @ApiQuery({ name: 'status', required: false, description: 'OPEN, WON, LOST' })
  async listDeals(
    @Query() raw: Record<string, string>,
    @CurrentUser() user?: AuthenticatedUser,
    @Headers('X-Tenant-Id') headerTenantId?: string,
  ): Promise<PaginatedResult<Deal>> {
    const tenantId = user?.tenantId || headerTenantId
    const parsed = DealFilterSchema.parse(raw)
    const filters: DealFilter & { requestingUserId?: string; requestingUserRole?: string } = {
      ...parsed,
      requestingUserId: user?.userId,
      requestingUserRole: user?.role,
    }
    return this.service.listDeals(filters, tenantId!)
  }

  @Post('deals')
  @ApiOperation({ summary: 'Crear una nueva oportunidad de venta (Deal)' })
  @ApiBody({ schema: { type: 'object', required: ['name', 'pipelineId', 'stageId', 'amount'], properties: {
    name: { type: 'string', example: 'Contrato Anual Software Enterprise' },
    amount: { type: 'number', example: 15000 },
    currency: { type: 'string', example: 'USD' },
    pipelineId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
    stageId: { type: 'string', example: '00000000-0000-0000-0000-000000000002' },
    contactId: { type: 'string', example: '00000000-0000-0000-0000-000000000003' },
    companyId: { type: 'string', example: '00000000-0000-0000-0000-000000000004' },
  } } })
  async createDeal(
    @Body(createZodPipe(CreateDealSchema)) dto: CreateDeal,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Deal> {
    return this.service.createDeal(dto, tenantId!)
  }

  @Get('deals/:dealId')
  @ApiOperation({ summary: 'Obtener un deal por ID' })
  @ApiParam({ name: 'dealId', description: 'UUID del deal' })
  async getDeal(@Param('dealId', ParseUUIDPipe) dealId: string, @Headers('X-Tenant-Id') tenantId?: string): Promise<Deal> {
    return this.service.getDeal(dealId, tenantId!)
  }

  @Put('deals/:dealId')
  @ApiOperation({ summary: 'Actualizar un deal' })
  @ApiParam({ name: 'dealId', description: 'UUID del deal' })
  @ApiBody({ schema: { type: 'object', properties: {
    name: { type: 'string', example: 'Contrato Renovación Licencias' },
    amount: { type: 'number', example: 20000 },
    expectedCloseDate: { type: 'string', example: '2026-12-15' },
  } } })
  async updateDeal(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body(createZodPipe(UpdateDealSchema)) dto: UpdateDeal,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Deal> {
    return this.service.updateDeal(dealId, dto, tenantId!)
  }

  @Put('deals/:dealId/move')
  @ApiOperation({ summary: 'Mover un deal a otra etapa del pipeline' })
  @ApiParam({ name: 'dealId', description: 'UUID del deal' })
  @ApiBody({ schema: { type: 'object', required: ['stageId'], properties: { stageId: { type: 'string', example: '00000000-0000-0000-0000-000000000005' } } } })
  async moveDeal(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body(createZodPipe(MoveDealSchema)) dto: { stageId: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Deal> {
    return this.service.moveDeal(dealId, dto.stageId, tenantId!)
  }

  @Put('deals/:dealId/win')
  @ApiOperation({ summary: 'Marcar oportunidad como Ganada (WON)' })
  @ApiParam({ name: 'dealId', description: 'UUID del deal' })
  @ApiBody({ schema: { type: 'object', properties: { amount: { type: 'number', example: 15000 } } } })
  async winDeal(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body(createZodPipe(WinDealSchema)) dto: { amount?: number },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Deal> {
    return this.service.winDeal(dealId, dto.amount, tenantId!)
  }

  @Put('deals/:dealId/lose')
  @ApiOperation({ summary: 'Marcar oportunidad como Perdida (LOST)' })
  @ApiParam({ name: 'dealId', description: 'UUID del deal' })
  @ApiBody({ schema: { type: 'object', properties: {
    lostReasonId: { type: 'string', example: 'PRECIO_ALTO' },
    lostNotes: { type: 'string', example: 'El cliente eligió proveedor con descuento mayor' },
  } } })
  async loseDeal(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body(createZodPipe(LoseDealSchema)) dto: { lostReasonId?: string; lostNotes?: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Deal> {
    return this.service.loseDeal(dealId, dto.lostReasonId, dto.lostNotes, tenantId!)
  }

  @Delete('deals/:dealId')
  @ApiOperation({ summary: 'Eliminar un deal' })
  @ApiParam({ name: 'dealId', description: 'UUID del deal' })
  async deleteDeal(@Param('dealId', ParseUUIDPipe) dealId: string, @Headers('X-Tenant-Id') tenantId?: string): Promise<void> {
    return this.service.deleteDeal(dealId, tenantId!)
  }

  @Get()
  @ApiOperation({ summary: 'Listar pipelines de ventas' })
  async listPipelines(@Headers('X-Tenant-Id') tenantId?: string): Promise<Pipeline[]> {
    return this.service.listPipelines(tenantId!)
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo pipeline' })
  @ApiBody({ schema: { type: 'object', required: ['name'], properties: { name: { type: 'string', example: 'Pipeline Ventas Corporativas B2B' } } } })
  async createPipeline(
    @Body(createZodPipe(CreatePipelineSchema)) dto: CreatePipeline,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Pipeline> {
    return this.service.createPipeline(dto, tenantId!)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tablero Kanban de un pipeline con sus etapas' })
  @ApiParam({ name: 'id', description: 'UUID del pipeline' })
  async getPipelineBoard(@Param('id', ParseUUIDPipe) id: string, @Headers('X-Tenant-Id') tenantId?: string): Promise<PipelineBoard> {
    return this.service.getPipelineBoard(id, tenantId!)
  }
}