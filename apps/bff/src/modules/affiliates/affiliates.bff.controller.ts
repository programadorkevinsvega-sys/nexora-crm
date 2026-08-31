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
import { AffiliatesBffService, PaginatedResult } from './affiliates.bff.service'
import type {
  CreateProgram,
  RegisterAffiliate,
  RecordCommission,
  ProcessPayout,
  AffiliateProgram, Affiliate,
  AffiliateCommission, AffiliatePayout,
} from '@crm/contracts'

@Controller('api/affiliates')
export class AffiliatesBffController {
  constructor(private readonly service: AffiliatesBffService) {}

  @Get('programs')
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
    }, tenantId!)
  }

  @Post('programs')
  async createProgram(
    @Body() dto: CreateProgram,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<AffiliateProgram> {
    return this.service.createProgram(dto, tenantId!)
  }

  @Get('programs/:id')
  async getProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<AffiliateProgram> {
    return this.service.getProgram(id, tenantId!)
  }

  @Put('programs/:id')
  async updateProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateProgram>,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.updateProgram(id, dto, tenantId!)
  }

  @Post('register')
  async registerAffiliate(
    @Body() dto: RegisterAffiliate,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Affiliate> {
    return this.service.registerAffiliate(dto, tenantId!)
  }

  @Get(':id')
  async getAffiliate(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Affiliate> {
    return this.service.getAffiliate(id, tenantId!)
  }

  @Get()
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
    }, tenantId!)
  }

  @Post(':id/commissions')
  async recordCommission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordCommission,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<AffiliateCommission> {
    return this.service.recordCommission(id, dto, tenantId!)
  }

  @Get(':id/commissions')
  async listCommissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<AffiliateCommission>> {
    return this.service.listCommissions(id, {
      status,
      cursor,
      limit: limit ? Number(limit) : undefined,
    }, tenantId!)
  }

  @Post(':id/payouts')
  async processPayout(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProcessPayout,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<AffiliatePayout> {
    return this.service.processPayout(id, dto, tenantId!)
  }

  @Get(':id/payouts')
  async listPayouts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<AffiliatePayout>> {
    return this.service.listPayouts(id, {
      status,
      cursor,
      limit: limit ? Number(limit) : undefined,
    }, tenantId!)
  }
}
