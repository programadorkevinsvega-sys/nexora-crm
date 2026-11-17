import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { CreateTeamHandler, UpdateTeamHandler, DeleteTeamHandler, AddMemberHandler, RemoveMemberHandler, SetQuotaHandler, UpdateAchievedHandler } from '../../application/commands/sales-team.handlers'
import { GetTeamHandler, ListTeamsHandler, GetTeamMembersHandler, GetQuotaHandler, ListQuotasHandler } from '../../application/queries/sales-team.handlers'
import { CreateTeamCommand, UpdateTeamCommand, DeleteTeamCommand, AddMemberCommand, RemoveMemberCommand, SetQuotaCommand, UpdateAchievedCommand } from '../../application/commands/sales-team.commands'
import { GetTeamQuery, ListTeamsQuery, GetTeamMembersQuery, GetQuotaQuery, ListQuotasQuery } from '../../application/queries/sales-team.queries'
import { SalesTeamMapper } from '../../infrastructure/sales-team.mapper'
import { SalesQuotaMapper } from '../../infrastructure/sales-quota.mapper'

@Controller()
export class SalesTeamsGrpcController {
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
    private readonly listMembersHandler: GetTeamMembersHandler,
    private readonly getQuotaHandler: GetQuotaHandler,
    private readonly listQuotasHandler: ListQuotasHandler,
  ) {}

  @GrpcMethod('SalesTeamService', 'CreateTeam')
  async createTeam(data: {
    tenantId: string
    name: string
    managerUserId?: string
    monthlyTarget?: number
  }) {
    const result = await this.createTeamHandler.execute(
      new CreateTeamCommand(data.tenantId, data.name, data.managerUserId, data.monthlyTarget),
    )
    const team = await this.getTeamHandler.execute(
      new GetTeamQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(SalesTeamMapper.toResponse(team)) }
  }

  @GrpcMethod('SalesTeamService', 'GetTeam')
  async getTeam(data: { tenantId: string; id: string }) {
    const team = await this.getTeamHandler.execute(
      new GetTeamQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(SalesTeamMapper.toResponse(team)) }
  }

  @GrpcMethod('SalesTeamService', 'ListTeams')
  async listTeams(data: {
    tenantId: string
    cursor?: string
    limit?: number
    search?: string
  }) {
    const result = await this.listTeamsHandler.execute(
      new ListTeamsQuery(data.tenantId, {
        search: data.search,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(t => JSON.stringify(SalesTeamMapper.toResponse(t))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('SalesTeamService', 'UpdateTeam')
  async updateTeam(data: {
    tenantId: string
    id: string
    name?: string
    managerUserId?: string
    monthlyTarget?: number
  }) {
    await this.updateTeamHandler.execute(
      new UpdateTeamCommand(data.tenantId, data.id, data.name, data.managerUserId, data.monthlyTarget),
    )
    return {}
  }

  @GrpcMethod('SalesTeamService', 'DeleteTeam')
  async deleteTeam(data: { tenantId: string; id: string }) {
    await this.deleteTeamHandler.execute(
      new DeleteTeamCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('SalesTeamService', 'AddMember')
  async addMember(data: { tenantId: string; teamId: string; userId: string }) {
    await this.addMemberHandler.execute(
      new AddMemberCommand(data.tenantId, data.teamId, data.userId),
    )
    return {}
  }

  @GrpcMethod('SalesTeamService', 'RemoveMember')
  async removeMember(data: { tenantId: string; teamId: string; userId: string }) {
    await this.removeMemberHandler.execute(
      new RemoveMemberCommand(data.tenantId, data.teamId, data.userId),
    )
    return {}
  }

  @GrpcMethod('SalesTeamService', 'ListMembers')
  async listMembers(data: { tenantId: string; teamId: string }) {
    const members = await this.listMembersHandler.execute(
      new GetTeamMembersQuery(data.tenantId, data.teamId),
    )
    return {
      jsonItems: members.map(m => JSON.stringify(SalesTeamMapper.memberToResponse(m))),
    }
  }

  @GrpcMethod('SalesTeamService', 'SetQuota')
  async setQuota(data: {
    tenantId: string
    teamId: string
    userId: string
    periodMonth: number
    periodYear: number
    targetAmount: number
  }) {
    const result = await this.setQuotaHandler.execute(
      new SetQuotaCommand(data.tenantId, data.teamId, data.userId, data.periodMonth, data.periodYear, data.targetAmount),
    )
    const quota = await this.getQuotaHandler.execute(
      new GetQuotaQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(SalesQuotaMapper.toResponse(quota)) }
  }

  @GrpcMethod('SalesTeamService', 'GetQuota')
  async getQuota(data: { tenantId: string; id: string }) {
    const quota = await this.getQuotaHandler.execute(
      new GetQuotaQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(SalesQuotaMapper.toResponse(quota)) }
  }

  @GrpcMethod('SalesTeamService', 'ListQuotas')
  async listQuotas(data: {
    tenantId: string
    teamId: string
    userId?: string
    periodMonth?: number
    periodYear?: number
    cursor?: string
    limit?: number
  }) {
    const result = await this.listQuotasHandler.execute(
      new ListQuotasQuery(data.tenantId, data.teamId, {
        userId: data.userId,
        periodMonth: data.periodMonth,
        periodYear: data.periodYear,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(q => JSON.stringify(SalesQuotaMapper.toResponse(q))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('SalesTeamService', 'UpdateAchieved')
  async updateAchieved(data: { tenantId: string; quotaId: string; achievedAmount: number }) {
    await this.updateAchievedHandler.execute(
      new UpdateAchievedCommand(data.tenantId, data.quotaId, data.achievedAmount),
    )
    return {}
  }
}
