import { Injectable } from '@nestjs/common'
import { eq, ilike, and, asc, gt } from 'drizzle-orm'
import { getDb, salesTeams, salesTeamMembers } from '@crm/database'
import { SalesTeamRepository, SalesTeamFilter, PaginatedSalesTeams, SalesTeamWithMembers, SalesTeamMemberRow } from '../domain/repositories/sales-team.repository'
import { SalesTeam } from '../domain/entities/sales-team.entity'
import { SalesTeamMapper } from './sales-team.mapper'

@Injectable()
export class DrizzleSalesTeamRepository extends SalesTeamRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<SalesTeam | null> {
    const row = await this.db.query.salesTeams.findFirst({
      where: and(eq(salesTeams.tenantId, tenantId)!, eq(salesTeams.id, id)) as any,
    })
    return row ? SalesTeamMapper.toDomain(row) : null
  }

  async findByName(tenantId: string, name: string): Promise<SalesTeam | null> {
    const row = await this.db.query.salesTeams.findFirst({
      where: and(eq(salesTeams.tenantId, tenantId)!, eq(salesTeams.name, name)) as any,
    })
    return row ? SalesTeamMapper.toDomain(row) : null
  }

  async findByIdWithMembers(tenantId: string, id: string): Promise<SalesTeamWithMembers | null> {
    const team = await this.findById(tenantId, id)
    if (!team) return null

    const members = await this.getMembers(id)
    return { ...team, members } as unknown as SalesTeamWithMembers
  }

  async list(tenantId: string, filter: SalesTeamFilter): Promise<PaginatedSalesTeams> {
    const conditions = [eq(salesTeams.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(salesTeams.createdAt, new Date(filter.cursor)))
    if (filter.search) conditions.push(ilike(salesTeams.name, `%${filter.search}%`))

    const rows = await this.db.query.salesTeams.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(salesTeams.createdAt), asc(salesTeams.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(SalesTeamMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(team: SalesTeam): Promise<void> {
    const row = SalesTeamMapper.toPersistence(team)
    await this.db.insert(salesTeams).values(row).onConflictDoUpdate({
      target: salesTeams.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(salesTeams).where(
      and(eq(salesTeams.tenantId, tenantId), eq(salesTeams.id, id)),
    )
  }

  async addMember(teamId: string, userId: string, tenantId: string): Promise<void> {
    await this.db.insert(salesTeamMembers).values({ teamId, userId, tenantId })
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    await this.db.delete(salesTeamMembers).where(
      and(eq(salesTeamMembers.teamId, teamId), eq(salesTeamMembers.userId, userId)),
    )
  }

  async getMembers(teamId: string): Promise<SalesTeamMemberRow[]> {
    return this.db.query.salesTeamMembers.findMany({
      where: eq(salesTeamMembers.teamId, teamId),
    })
  }
}
