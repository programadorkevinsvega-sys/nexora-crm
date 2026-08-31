import { SalesTeam } from '../domain/entities/sales-team.entity'

type SalesTeamRow = {
  id: string
  tenantId: string
  name: string
  managerUserId: string | null
  monthlyTarget: string | null
  createdAt: Date
  updatedAt: Date
}

type SalesTeamMemberRow = {
  teamId: string
  userId: string
  tenantId: string
}

export class SalesTeamMapper {
  static toDomain(row: SalesTeamRow): SalesTeam {
    return new SalesTeam(
      row.id,
      row.tenantId,
      row.name,
      row.managerUserId,
      row.monthlyTarget ? Number(row.monthlyTarget) : null,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(team: SalesTeam): SalesTeamRow {
    return {
      id: team.id,
      tenantId: team.tenantId,
      name: team.name,
      managerUserId: team.managerUserId,
      monthlyTarget: team.monthlyTarget?.toString() ?? null,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    }
  }

  static toResponse(team: SalesTeam) {
    return {
      id: team.id,
      name: team.name,
      managerUserId: team.managerUserId,
      monthlyTarget: team.monthlyTarget,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    }
  }

  static memberToResponse(member: SalesTeamMemberRow) {
    return {
      teamId: member.teamId,
      userId: member.userId,
    }
  }
}
