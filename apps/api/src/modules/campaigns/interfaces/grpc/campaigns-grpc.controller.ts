import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { CreateCampaignHandler, UpdateCampaignHandler, ChangeCampaignStatusHandler, AddMemberHandler, UpdateMemberStatusHandler, DeleteCampaignHandler } from '../../application/commands/campaign.handlers'
import { GetCampaignHandler, ListCampaignsHandler, GetCampaignMembersHandler } from '../../application/queries/campaign.handlers'
import { CreateCampaignCommand, UpdateCampaignCommand, ChangeCampaignStatusCommand, AddMemberCommand, UpdateMemberStatusCommand, DeleteCampaignCommand } from '../../application/commands/campaign.commands'
import { GetCampaignQuery, ListCampaignsQuery, GetCampaignMembersQuery } from '../../application/queries/campaign.queries'
import { CampaignMapper } from '../../infrastructure/campaign.mapper'
import { CampaignStatus } from '../../domain/entities/campaign.entity'
import { CampaignMemberStatus } from '../../domain/entities/campaign-member.entity'

@Controller()
export class CampaignsGrpcController {
  constructor(
    private readonly createHandler: CreateCampaignHandler,
    private readonly updateHandler: UpdateCampaignHandler,
    private readonly changeStatusHandler: ChangeCampaignStatusHandler,
    private readonly deleteHandler: DeleteCampaignHandler,
    private readonly addMemberHandler: AddMemberHandler,
    private readonly updateMemberStatusHandler: UpdateMemberStatusHandler,
    private readonly getHandler: GetCampaignHandler,
    private readonly listHandler: ListCampaignsHandler,
    private readonly listMembersHandler: GetCampaignMembersHandler,
  ) {}

  @GrpcMethod('CampaignService', 'CreateCampaign')
  async create(data: {
    tenantId: string
    name: string
    type?: string
    status?: string
    startDate?: string
    endDate?: string
    budgetedCost?: number
    actualCost?: number
    expectedRevenue?: number
  }) {
    const result = await this.createHandler.execute(
      new CreateCampaignCommand(
        data.tenantId, data.name,
        data.type, data.status as CampaignStatus,
        data.startDate, data.endDate,
        data.budgetedCost, data.actualCost,
        data.expectedRevenue,
      ),
    )
    const campaign = await this.getHandler.execute(
      new GetCampaignQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(CampaignMapper.toResponse(campaign)) }
  }

  @GrpcMethod('CampaignService', 'GetCampaign')
  async getById(data: { tenantId: string; id: string }) {
    const campaign = await this.getHandler.execute(
      new GetCampaignQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(CampaignMapper.toResponse(campaign)) }
  }

  @GrpcMethod('CampaignService', 'ListCampaigns')
  async list(data: {
    tenantId: string
    cursor?: string
    limit?: number
    search?: string
    status?: string
    type?: string
  }) {
    const result = await this.listHandler.execute(
      new ListCampaignsQuery(data.tenantId, {
        search: data.search,
        status: data.status,
        type: data.type,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(c => JSON.stringify(CampaignMapper.toResponse(c))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('CampaignService', 'UpdateCampaign')
  async update(data: {
    tenantId: string
    id: string
    name?: string
    type?: string
    startDate?: string
    endDate?: string
    budgetedCost?: number
    actualCost?: number
    expectedRevenue?: number
  }) {
    await this.updateHandler.execute(
      new UpdateCampaignCommand(
        data.tenantId, data.id,
        data.name, data.type,
        data.startDate, data.endDate,
        data.budgetedCost, data.actualCost,
        data.expectedRevenue,
      ),
    )
    return {}
  }

  @GrpcMethod('CampaignService', 'UpdateCampaignStatus')
  async updateStatus(data: { tenantId: string; id: string; status: string }) {
    await this.changeStatusHandler.execute(
      new ChangeCampaignStatusCommand(data.tenantId, data.id, data.status as CampaignStatus),
    )
    return {}
  }

  @GrpcMethod('CampaignService', 'DeleteCampaign')
  async delete(data: { tenantId: string; id: string }) {
    await this.deleteHandler.execute(
      new DeleteCampaignCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('CampaignService', 'ListMembers')
  async listMembers(data: {
    tenantId: string
    campaignId: string
    cursor?: string
    limit?: number
  }) {
    const result = await this.listMembersHandler.execute(
      new GetCampaignMembersQuery(data.tenantId, data.campaignId, data.cursor, Math.min(data.limit || 20, 100)),
    )
    return {
      jsonItems: result.data.map(m => JSON.stringify(CampaignMapper.memberToResponse(m))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('CampaignService', 'AddMember')
  async addMember(data: { tenantId: string; campaignId: string; contactId: string }) {
    const result = await this.addMemberHandler.execute(
      new AddMemberCommand(data.tenantId, data.campaignId, data.contactId),
    )
    return { json: JSON.stringify({ id: result.id }) }
  }

  @GrpcMethod('CampaignService', 'UpdateMemberStatus')
  async updateMemberStatus(data: { tenantId: string; id: string; status: string }) {
    await this.updateMemberStatusHandler.execute(
      new UpdateMemberStatusCommand(data.tenantId, data.id, data.status as CampaignMemberStatus),
    )
    return {}
  }
}
