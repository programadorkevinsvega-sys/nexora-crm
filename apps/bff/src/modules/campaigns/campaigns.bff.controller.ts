import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { z } from 'zod'
import { CreateCampaignSchema, AddCampaignMemberSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { CampaignsBffService, CampaignFilters, PaginatedResult } from './campaigns.bff.service'
import type { CreateCampaign, Campaign, AddCampaignMember, CampaignMember } from '@crm/contracts'

const UpdateCampaignStatusSchema = z.object({
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
})

const UpdateMemberStatusSchema = z.object({
  status: z.enum(['SENT', 'OPENED', 'CLICKED', 'RESPONDED', 'BOUNCED', 'UNSUBSCRIBED']),
})

@ApiTags('Marketing: Campañas (Campaigns)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/campaigns')
export class CampaignsBffController {
  constructor(private readonly service: CampaignsBffService) {}

  @Get()
  @ApiOperation({ summary: 'Listar campañas de marketing' })
  @ApiQuery({ name: 'status', required: false, description: 'PLANNED, ACTIVE, COMPLETED, CANCELLED' })
  @ApiQuery({ name: 'type', required: false, description: 'EMAIL, WHATSAPP, SMS' })
  async list(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Campaign>> {
    const filters: CampaignFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      status,
      type,
    }
    return this.service.list(filters, tenantId!)
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva campaña' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'type'],
      properties: {
        name: { type: 'string', example: 'Lanzamiento Promoción Black Friday' },
        type: { type: 'string', example: 'EMAIL' },
        budget: { type: 'number', example: 500 },
        startDate: { type: 'string', example: '2026-11-20' },
        endDate: { type: 'string', example: '2026-11-30' },
      },
    },
  })
  async create(
    @Body(createZodPipe(CreateCampaignSchema)) dto: CreateCampaign,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.create(dto, tenantId!)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener campaña por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la campaña' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.getById(id, tenantId!)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una campaña' })
  @ApiParam({ name: 'id', description: 'UUID de la campaña' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Lanzamiento Promoción CyberWeek' },
        budget: { type: 'number', example: 750 },
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateCampaign>,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.update(id, dto, tenantId!)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de la campaña' })
  @ApiParam({ name: 'id', description: 'UUID de la campaña' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', example: 'ACTIVE' },
      },
    },
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateCampaignStatusSchema)) dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.updateStatus(id, dto.status, tenantId!)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una campaña' })
  @ApiParam({ name: 'id', description: 'UUID de la campaña' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.delete(id, tenantId!)
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar contactos/miembros asignados a la campaña' })
  @ApiParam({ name: 'id', description: 'UUID de la campaña' })
  async listMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<CampaignMember>> {
    return this.service.listMembers(id, { cursor, limit: limit ? Number(limit) : undefined }, tenantId!)
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Agregar un contacto como miembro de la campaña' })
  @ApiParam({ name: 'id', description: 'UUID de la campaña' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['contactId'],
      properties: {
        contactId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
      },
    },
  })
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(AddCampaignMemberSchema)) dto: AddCampaignMember,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<CampaignMember> {
    return this.service.addMember(id, dto, tenantId!)
  }

  @Patch('members/:memberId/status')
  @ApiOperation({ summary: 'Actualizar estado de entrega de un miembro' })
  @ApiParam({ name: 'memberId', description: 'UUID del miembro de la campaña' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', example: 'OPENED' },
      },
    },
  })
  async updateMemberStatus(
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body(createZodPipe(UpdateMemberStatusSchema)) dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ id: string }> {
    return this.service.updateMemberStatus(memberId, dto.status, tenantId!)
  }
}
