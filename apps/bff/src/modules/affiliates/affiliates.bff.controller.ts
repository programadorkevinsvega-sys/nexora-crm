import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { AffiliatesBffService, PaginatedResult } from './affiliates.bff.service'
import type {
  CreateProgram,
  RegisterAffiliate,
  RecordCommission,
  ProcessPayout,
  AffiliateProgram, Affiliate,
  AffiliateCommission, AffiliatePayout,
} from '@crm/contracts'

@ApiTags('Marketing de Afiliados (Affiliates)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/affiliates')
export class AffiliatesBffController {
  constructor(private readonly service: AffiliatesBffService) {}

  @Get('programs')
  @ApiOperation({ summary: 'Listar programas de afiliados' })
  async listPrograms(
    @Query('isActive') isActive?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<AffiliateProgram>> {
    return this.service.listPrograms({
      isActive: isActive != null ? isActive === 'true' : undefined,
      cursor,
      limit: limit ? Number(limit) : undefined,
    }, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('programs')
  @ApiOperation({ summary: 'Crear un nuevo programa de afiliados' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'commissionRate'],
      properties: {
        name: { type: 'string', example: 'Programa de Embajadores 20%' },
        commissionRate: { type: 'number', example: 20 },
        cookieDays: { type: 'number', example: 30 },
      },
    },
  })
  async createProgram(
    @Body() dto: CreateProgram,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<AffiliateProgram> {
    return this.service.createProgram(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('programs/:id')
  @ApiOperation({ summary: 'Obtener programa por ID' })
  @ApiParam({ name: 'id', description: 'UUID del programa' })
  async getProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<AffiliateProgram> {
    return this.service.getProgram(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo afiliado' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['programId', 'email', 'name'],
      properties: {
        programId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        email: { type: 'string', example: 'afiliado@promociones.com' },
        name: { type: 'string', example: 'Agencia Digital Pro' },
        payoutMethod: { type: 'string', example: 'PAYPAL' },
      },
    },
  })
  async registerAffiliate(
    @Body() dto: RegisterAffiliate,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Affiliate> {
    return this.service.registerAffiliate(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener afiliado por ID' })
  @ApiParam({ name: 'id', description: 'UUID del afiliado' })
  async getAffiliate(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Affiliate> {
    return this.service.getAffiliate(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get()
  @ApiOperation({ summary: 'Listar afiliados registrados' })
  async listAffiliates(
    @Query('programId') programId?: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Affiliate>> {
    return this.service.listAffiliates({
      programId,
      status,
      cursor,
      limit: limit ? Number(limit) : undefined,
    }, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
