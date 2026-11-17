import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { getDb, agentProfiles as agentProfilesTable } from '@crm/database'
import { AgentRepository } from '../domain/repositories/agent.repository'
import { AgentProfile } from '../domain/entities/agent-profile.entity'
import { AgentProfileMapper } from './mappers/agent-profile.mapper'

@Injectable()
export class DrizzleAgentRepository extends AgentRepository {
  private get db() {
    return getDb()
  }

  async findByUserId(tenantId: string, userId: string): Promise<AgentProfile | null> {
    const row = await this.db.query.agentProfiles.findFirst({
      where: and(eq(agentProfilesTable.tenantId, tenantId)!, eq(agentProfilesTable.userId, userId)) as any,
    })
    return row ? AgentProfileMapper.toDomain(row) : null
  }

  async findById(tenantId: string, id: string): Promise<AgentProfile | null> {
    const row = await this.db.query.agentProfiles.findFirst({
      where: and(eq(agentProfilesTable.tenantId, tenantId)!, eq(agentProfilesTable.id, id)) as any,
    })
    return row ? AgentProfileMapper.toDomain(row) : null
  }

  async save(profile: AgentProfile): Promise<void> {
    const row = AgentProfileMapper.toPersistence(profile)
    await this.db.insert(agentProfilesTable).values(row).onConflictDoUpdate({
      target: agentProfilesTable.id,
      set: row,
    })
  }
}
