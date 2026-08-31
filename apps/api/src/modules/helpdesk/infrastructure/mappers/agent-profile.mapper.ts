import { AgentProfile } from '../../domain/entities/agent-profile.entity'

type AgentProfileRow = {
  id: string
  tenantId: string
  userId: string
  isAvailable: boolean | null
  agentStatus: string | null
  activeTicketsCount: number | null
  resolvedTicketsCount: number | null
  createdAt: Date
  updatedAt: Date
}

export class AgentProfileMapper {
  static toDomain(row: AgentProfileRow): AgentProfile {
    return new AgentProfile(
      row.id,
      row.tenantId,
      row.userId,
      row.isAvailable ?? false,
      row.agentStatus ?? "AVAILABLE",
      row.activeTicketsCount ?? 0,
      row.resolvedTicketsCount ?? 0,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(profile: AgentProfile): AgentProfileRow {
    return {
      id: profile.id,
      tenantId: profile.tenantId,
      userId: profile.userId,
      isAvailable: profile.isAvailable,
      agentStatus: profile.agentStatus,
      activeTicketsCount: profile.activeTicketsCount,
      resolvedTicketsCount: profile.resolvedTicketsCount,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }
  }

  static toResponse(profile: AgentProfile) {
    return {
      id: profile.id,
      userId: profile.userId,
      isAvailable: profile.isAvailable,
      agentStatus: profile.agentStatus,
      activeTicketsCount: profile.activeTicketsCount,
      resolvedTicketsCount: profile.resolvedTicketsCount,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    }
  }
}
