import { AgentProfile } from '../entities/agent-profile.entity'

export abstract class AgentRepository {
  abstract findByUserId(tenantId: string, userId: string): Promise<AgentProfile | null>
  abstract findById(tenantId: string, id: string): Promise<AgentProfile | null>
  abstract save(profile: AgentProfile): Promise<void>
}
