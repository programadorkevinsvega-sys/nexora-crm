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
import { z } from 'zod'
import {
  CreateCampaignSchema,
  AddCampaignMemberSchema,
} from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { CampaignsBffService, CampaignFilters, PaginatedResult } from './campaigns.bff.service'
import type { CreateCampaign, Campaign, AddCampaignMember, CampaignMember } from '@crm/contracts'

const UpdateCampaignStatusSchema = z.object({
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
})

const UpdateMemberStatusSchema = z.object({
  status: z.enum(['SENT', 'OPENED', 'CLICKED', 'RESPONDED', 'BOUNCED', 'UNSUBSCRIBED']),
})

@Controller('api')
export class CampaignsBffController {
  constructor(private readonly service: CampaignsBffService) {}

  @Get('campaigns')
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

  @Post('campaigns')
  async create(
    @Body(createZodPipe(CreateCampaignSchema)) dto: CreateCampaign,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.create(dto, tenantId!)
  }

  @Get('campaigns/:id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.getById(id, tenantId!)
  }

  @Put('campaigns/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateCampaign>,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.update(id, dto, tenantId!)
  }

  @Patch('campaigns/:id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateCampaignStatusSchema)) dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.updateStatus(id, dto.status, tenantId!)
  }

  @Delete('campaigns/:id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.delete(id, tenantId!)
  }

  @Get('campaigns/:id/members')
  async listMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<CampaignMember>> {
    return this.service.listMembers(id, { cursor, limit: limit ? Number(limit) : undefined }, tenantId!)
  }

  @Post('campaigns/:id/members')
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(AddCampaignMemberSchema)) dto: AddCampaignMember,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<CampaignMember> {
    return this.service.addMember(id, dto, tenantId!)
  }

  @Patch('campaigns/members/:memberId/status')
  async updateMemberStatus(
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body(createZodPipe(UpdateMemberStatusSchema)) dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ id: string }> {
    return this.service.updateMemberStatus(memberId, dto.status, tenantId!)
  }
}
