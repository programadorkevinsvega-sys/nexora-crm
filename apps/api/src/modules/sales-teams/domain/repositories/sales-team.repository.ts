import { SalesTeam } from '../entities/sales-team.entity'

export interface SalesTeamMemberRow {
  teamId: string
  userId: string
  tenantId: string
}

export interface SalesTeamWithMembers extends SalesTeam {
  members: SalesTeamMemberRow[]
}

export interface SalesTeamFilter {
  search?: string
  cursor?: string
  limit: number
}

export interface PaginatedSalesTeams {
  data: SalesTeam[]
  nextCursor: string | null
}

export abstract class SalesTeamRepository {
  abstract findById(tenantId: string, id: string): Promise<SalesTeam | null>
  abstract findByName(tenantId: string, name: string): Promise<SalesTeam | null>
  abstract findByIdWithMembers(tenantId: string, id: string): Promise<SalesTeamWithMembers | null>
  abstract list(tenantId: string, filter: SalesTeamFilter): Promise<PaginatedSalesTeams>
  abstract save(team: SalesTeam): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
  abstract addMember(teamId: string, userId: string, tenantId: string): Promise<void>
  abstract removeMember(teamId: string, userId: string): Promise<void>
  abstract getMembers(teamId: string): Promise<SalesTeamMemberRow[]>
}
