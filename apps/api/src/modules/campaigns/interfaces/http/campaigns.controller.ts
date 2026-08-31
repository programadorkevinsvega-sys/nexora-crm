import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import {
  CreateCampaignHandler,
  UpdateCampaignHandler,
  ChangeCampaignStatusHandler,
  AddMemberHandler,
  UpdateMemberStatusHandler,
  DeleteCampaignHandler,
} from '../../application/commands/campaign.handlers'
import { GetCampaignHandler, ListCampaignsHandler, GetCampaignMembersHandler } from '../../application/queries/campaign.handlers'
import {
  CreateCampaignCommand,
  UpdateCampaignCommand,
  ChangeCampaignStatusCommand,
  AddMemberCommand,
  UpdateMemberStatusCommand,
  DeleteCampaignCommand,
} from '../../application/commands/campaign.commands'
import { GetCampaignQuery, ListCampaignsQuery, GetCampaignMembersQuery } from '../../application/queries/campaign.queries'
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  ChangeCampaignStatusDto,
  AddMemberDto,
  UpdateMemberStatusDto,
} from './dto/campaign.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { CampaignMapper } from '../../infrastructure/campaign.mapper'

@Controller('campaigns')
export class CampaignsController {
  constructor(
    private readonly createHandler: CreateCampaignHandler,
    private readonly updateHandler: UpdateCampaignHandler,
    private readonly changeStatusHandler: ChangeCampaignStatusHandler,
    private readonly deleteHandler: DeleteCampaignHandler,
    private readonly getHandler: GetCampaignHandler,
    private readonly listHandler: ListCampaignsHandler,
    private readonly addMemberHandler: AddMemberHandler,
    private readonly updateMemberStatusHandler: UpdateMemberStatusHandler,
    private readonly getMembersHandler: GetCampaignMembersHandler,
  ) {}

  @Post()
  async create(@Body() dto: CreateCampaignDto, @TenantId() tenantId: string) {
    const result = await this.createHandler.execute(
      new CreateCampaignCommand(
        tenantId,
        dto.name,
        dto.type,
        dto.status,
        dto.startDate,
        dto.endDate,
        dto.budgetedCost,
        dto.actualCost,
        dto.expectedRevenue,
      ),
    )
    return result
  }

  @Get()
  async list(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('search') search: string | undefined,
    @Query('status') status: string | undefined,
    @Query('type') type: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listHandler.execute(
      new ListCampaignsQuery(tenantId, {
        search,
        status,
        type,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(CampaignMapper.toResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Get(':id')
  async get(@Param('id') id: string, @TenantId() tenantId: string) {
    const campaign = await this.getHandler.execute(new GetCampaignQuery(tenantId, id))
    return CampaignMapper.toResponse(campaign)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCampaignDto, @TenantId() tenantId: string) {
    await this.updateHandler.execute(
      new UpdateCampaignCommand(
        tenantId,
        id,
        dto.name,
        dto.type,
        dto.startDate,
        dto.endDate,
        dto.budgetedCost,
        dto.actualCost,
        dto.expectedRevenue,
      ),
    )
    return { id }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.deleteHandler.execute(new DeleteCampaignCommand(tenantId, id))
    return { id }
  }

  @Put(':id/status')
  async changeStatus(@Param('id') id: string, @Body() dto: ChangeCampaignStatusDto, @TenantId() tenantId: string) {
    await this.changeStatusHandler.execute(new ChangeCampaignStatusCommand(tenantId, id, dto.status))
    return { id }
  }

  @Get(':campaignId/members')
  async listMembers(
    @Param('campaignId') campaignId: string,
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.getMembersHandler.execute(
      new GetCampaignMembersQuery(tenantId, campaignId, cursor, Math.min(Number(limit) || 50, 200)),
    )
    return {
      data: result.data.map(CampaignMapper.memberToResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Post(':campaignId/members')
  async addMember(@Param('campaignId') campaignId: string, @Body() dto: AddMemberDto, @TenantId() tenantId: string) {
    const result = await this.addMemberHandler.execute(
      new AddMemberCommand(tenantId, campaignId, dto.contactId),
    )
    return result
  }

  @Put('members/:id/status')
  async updateMemberStatus(@Param('id') id: string, @Body() dto: UpdateMemberStatusDto, @TenantId() tenantId: string) {
    await this.updateMemberStatusHandler.execute(
      new UpdateMemberStatusCommand(tenantId, id, dto.status),
    )
    return { id }
  }
}
