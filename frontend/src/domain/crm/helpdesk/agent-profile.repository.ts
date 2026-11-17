import type { AgentProfile, AgentProfileUpdateInput } from "./agent-profile.entity"

export interface AgentProfileRepository {
  getByUserId(userId: string): Promise<AgentProfile | null>
  update(id: string, data: AgentProfileUpdateInput): Promise<AgentProfile>
}
