import { Controller, Get, Post, Patch, Param, Body, Query, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PrmBffService } from './prm.bff.service'
import type {
  PartnerTier,
  Partner,
  CreatePartnerDto,
  PartnerDealRegistration,
  CreateDealRegistrationDto,
} from '@crm/contracts'

@ApiTags('Partner Relationship Management (PRM)')
@Controller('api/prm')
export class PrmBffController {
  constructor(private readonly service: PrmBffService) {}

  @Get('tiers')
  @ApiOperation({ summary: 'Listar niveles y beneficios de partners (Tiers)' })
  async listTiers(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<PartnerTier[]> {
    return this.service.listTiers(tenantId)
  }

  @Get('partners')
  @ApiOperation({ summary: 'Listar socios y canales comerciales registrados' })
  async listPartners(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<Partner[]> {
    return this.service.listPartners(tenantId)
  }

  @Post('partners')
  @ApiOperation({ summary: 'Registrar un nuevo socio / canal comercial' })
  async createPartner(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreatePartnerDto,
  ): Promise<Partner> {
    return this.service.createPartner(tenantId, dto)
  }

  @Get('deals')
  @ApiOperation({ summary: 'Listar registros de oportunidades protegidas de partners (Deal Registration)' })
  async listDealRegistrations(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Query('partnerId') partnerId?: string,
  ): Promise<PartnerDealRegistration[]> {
    return this.service.listDealRegistrations(tenantId, partnerId)
  }

  @Post('deals')
  @ApiOperation({ summary: 'Registrar una nueva oportunidad comercial para protección de canal' })
  async submitDealRegistration(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateDealRegistrationDto,
  ): Promise<PartnerDealRegistration> {
    return this.service.submitDealRegistration(tenantId, dto)
  }

  @Patch('deals/:id/approve')
  @ApiOperation({ summary: 'Aprobar registro y protección de deal registrado por partner' })
  async approveDealRegistration(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-user-id') reviewerUserId = '00000000-0000-0000-0000-000000000001',
    @Param('id') registrationId: string,
  ): Promise<PartnerDealRegistration> {
    return this.service.approveDealRegistration(tenantId, registrationId, reviewerUserId)
  }
}
