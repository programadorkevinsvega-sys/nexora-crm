import { Injectable } from '@nestjs/common'
import { SalesTeamRepository } from '../../domain/repositories/sales-team.repository'
import { SalesQuotaRepository } from '../../domain/repositories/sales-quota.repository'
import { GetTeamQuery, ListTeamsQuery, GetTeamMembersQuery, GetQuotaQuery, ListQuotasQuery } from './sales-team.queries'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class GetTeamHandler {
  constructor(private readonly repo: SalesTeamRepository) {}

  async execute(query: GetTeamQuery) {
    const team = await this.repo.findByIdWithMembers(query.tenantId, query.id)
    if (!team) throw new NotFoundError('Sales Team', query.id)
    return team
  }
}

@Injectable()
export class ListTeamsHandler {
  constructor(private readonly repo: SalesTeamRepository) {}

  async execute(query: ListTeamsQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}

@Injectable()
export class GetTeamMembersHandler {
  constructor(private readonly repo: SalesTeamRepository) {}

  async execute(query: GetTeamMembersQuery) {
    return this.repo.getMembers(query.teamId)
  }
}

@Injectable()
export class GetQuotaHandler {
  constructor(private readonly repo: SalesQuotaRepository) {}

  async execute(query: GetQuotaQuery) {
    const quota = await this.repo.findById(query.tenantId, query.id)
    if (!quota) throw new NotFoundError('Sales Quota', query.id)
    return quota
  }
}

@Injectable()
export class ListQuotasHandler {
  constructor(private readonly repo: SalesQuotaRepository) {}

  async execute(query: ListQuotasQuery) {
    return this.repo.listByTeam(query.tenantId, query.teamId, query.filter)
  }
}
