import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import {
  CreateTeamHandler, UpdateTeamHandler, DeleteTeamHandler,
  AddMemberHandler, RemoveMemberHandler,
  SetQuotaHandler, UpdateAchievedHandler,
} from '../../application/commands/sales-team.handlers'
import { GetTeamHandler, ListTeamsHandler, GetQuotaHandler, ListQuotasHandler, GetTeamMembersHandler } from '../../application/queries/sales-team.handlers'
import {
  CreateTeamCommand, UpdateTeamCommand, DeleteTeamCommand,
  AddMemberCommand, RemoveMemberCommand,
  SetQuotaCommand, UpdateAchievedCommand,
} from '../../application/commands/sales-team.commands'
import { GetTeamQuery, ListTeamsQuery, GetQuotaQuery, ListQuotasQuery, GetTeamMembersQuery } from '../../application/queries/sales-team.queries'
import {
  CreateTeamDto, UpdateTeamDto, AddMemberDto, SetQuotaDto, UpdateAchievedDto,
} from './dto/sales-team.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { SalesTeamMapper } from '../../infrastructure/sales-team.mapper'
import { SalesQuotaMapper } from '../../infrastructure/sales-quota.mapper'

@Controller('sales-teams')
export class SalesTeamsController {
  constructor(
    private readonly createTeamHandler: CreateTeamHandler,
    private readonly updateTeamHandler: UpdateTeamHandler,
    private readonly deleteTeamHandler: DeleteTeamHandler,
    private readonly addMemberHandler: AddMemberHandler,
    private readonly removeMemberHandler: RemoveMemberHandler,
    private readonly setQuotaHandler: SetQuotaHandler,
    private readonly updateAchievedHandler: UpdateAchievedHandler,
    private readonly getTeamHandler: GetTeamHandler,
    private readonly listTeamsHandler: ListTeamsHandler,
    private readonly getTeamMembersHandler: GetTeamMembersHandler,
    private readonly getQuotaHandler: GetQuotaHandler,
    private readonly listQuotasHandler: ListQuotasHandler,
  ) {}

  @Post()
  async create(@Body() dto: CreateTeamDto, @TenantId() tenantId: string) {
    return this.createTeamHandler.execute(
      new CreateTeamCommand(tenantId, dto.name, dto.managerUserId, dto.monthlyTarget),
    )
  }

  @Get()
  async list(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('search') search: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listTeamsHandler.execute(
      new ListTeamsQuery(tenantId, {
        search,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(SalesTeamMapper.toResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Get(':id')
  async get(@Param('id') id: string, @TenantId() tenantId: string) {
    const team = await this.getTeamHandler.execute(new GetTeamQuery(tenantId, id))
    return {
      ...SalesTeamMapper.toResponse(team),
      members: team.members.map(SalesTeamMapper.memberToResponse),
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTeamDto, @TenantId() tenantId: string) {
    await this.updateTeamHandler.execute(
      new UpdateTeamCommand(tenantId, id, dto.name, dto.managerUserId, dto.monthlyTarget),
    )
    return { id }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.deleteTeamHandler.execute(new DeleteTeamCommand(tenantId, id))
    return { id }
  }

  @Post(':id/members')
  async addMember(@Param('id') id: string, @Body() dto: AddMemberDto, @TenantId() tenantId: string) {
    await this.addMemberHandler.execute(new AddMemberCommand(tenantId, id, dto.userId))
    return { teamId: id, userId: dto.userId }
  }

  @Delete(':id/members/:userId')
  async removeMember(@Param('id') id: string, @Param('userId') userId: string, @TenantId() tenantId: string) {
    await this.removeMemberHandler.execute(new RemoveMemberCommand(tenantId, id, userId))
    return { teamId: id, userId }
  }

  @Get(':id/quotas')
  async listQuotas(
    @Param('id') id: string,
    @Query('userId') userId: string | undefined,
    @Query('periodMonth') periodMonth: string | undefined,
    @Query('periodYear') periodYear: string | undefined,
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listQuotasHandler.execute(
      new ListQuotasQuery(tenantId, id, {
        userId,
        periodMonth: periodMonth ? Number(periodMonth) : undefined,
        periodYear: periodYear ? Number(periodYear) : undefined,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(SalesQuotaMapper.toResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Post(':id/quotas')
  async setQuota(@Param('id') id: string, @Body() dto: SetQuotaDto, @TenantId() tenantId: string) {
    return this.setQuotaHandler.execute(
      new SetQuotaCommand(tenantId, id, dto.userId, dto.periodMonth, dto.periodYear, dto.targetAmount),
    )
  }

  @Put(':id/quotas/:quotaId/achieved')
  async updateAchieved(
    @Param('id') _id: string,
    @Param('quotaId') quotaId: string,
    @Body() dto: UpdateAchievedDto,
    @TenantId() tenantId: string,
  ) {
    await this.updateAchievedHandler.execute(new UpdateAchievedCommand(tenantId, quotaId, dto.achievedAmount))
    return { quotaId }
  }
}
