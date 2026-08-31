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
  CreateSalesTeamSchema,
  CreateQuotaSchema,
} from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { SalesTeamsBffService, SalesTeamFilters, PaginatedResult } from './sales-teams.bff.service'
import type { CreateSalesTeam, SalesTeam, CreateQuota, SalesQuota } from '@crm/contracts'

const AddMemberBodySchema = z.object({
  userId: z.string().uuid(),
})

const UpdateAchievedSchema = z.object({
  achievedAmount: z.number(),
})

@Controller('api')
export class SalesTeamsBffController {
  constructor(private readonly service: SalesTeamsBffService) {}

  @Get('sales-teams')
  async list(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<SalesTeam>> {
    const filters: SalesTeamFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      search,
    }
    return this.service.list(filters, tenantId!)
  }

  @Post('sales-teams')
  async create(
    @Body(createZodPipe(CreateSalesTeamSchema)) dto: CreateSalesTeam,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SalesTeam> {
    return this.service.create(dto, tenantId!)
  }

  @Get('sales-teams/:id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SalesTeam> {
    return this.service.getById(id, tenantId!)
  }

  @Put('sales-teams/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateSalesTeam>,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SalesTeam> {
    return this.service.update(id, dto, tenantId!)
  }

  @Delete('sales-teams/:id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.delete(id, tenantId!)
  }

  @Post('sales-teams/:id/members')
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(AddMemberBodySchema)) dto: { userId: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.addMember(id, dto.userId, tenantId!)
  }

  @Delete('sales-teams/:id/members/:userId')
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.removeMember(id, userId, tenantId!)
  }

  @Get('sales-teams/:id/members')
  async listMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<unknown[]> {
    return this.service.listMembers(id, tenantId!)
  }

  @Post('sales-teams/:id/quotas')
  async createQuota(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(CreateQuotaSchema)) dto: CreateQuota,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SalesQuota> {
    return this.service.createQuota(id, dto, tenantId!)
  }

  @Get('sales-teams/:id/quotas')
  async listQuotas(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('periodMonth') periodMonth?: string,
    @Query('periodYear') periodYear?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<SalesQuota>> {
    return this.service.listQuotas(id, {
      cursor,
      limit: limit ? Number(limit) : undefined,
      periodMonth: periodMonth ? Number(periodMonth) : undefined,
      periodYear: periodYear ? Number(periodYear) : undefined,
    }, tenantId!)
  }

  @Get('sales-teams/quotas/:quotaId')
  async getQuota(
    @Param('quotaId', ParseUUIDPipe) quotaId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SalesQuota> {
    return this.service.getQuota(quotaId, tenantId!)
  }

  @Patch('sales-teams/quotas/:quotaId/achieved')
  async updateQuotaAchieved(
    @Param('quotaId', ParseUUIDPipe) quotaId: string,
    @Body(createZodPipe(UpdateAchievedSchema)) dto: { achievedAmount: number },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SalesQuota> {
    return this.service.updateQuotaAchieved(quotaId, dto.achievedAmount, tenantId!)
  }
}
