export class AgentProfile {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly userId: string,
    readonly isAvailable: boolean,
    readonly agentStatus: string,
    readonly activeTicketsCount: number,
    readonly resolvedTicketsCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    userId: string
    isAvailable?: boolean
    agentStatus?: string
  }): AgentProfile {
    return new AgentProfile(
      crypto.randomUUID(),
      props.tenantId,
      props.userId,
      props.isAvailable ?? true,
      props.agentStatus ?? 'AVAILABLE',
      0,
      0,
      new Date(),
      new Date(),
    )
  }

  updateAvailability(isAvailable: boolean, agentStatus?: string): AgentProfile {
    return new AgentProfile(
      this.id,
      this.tenantId,
      this.userId,
      isAvailable,
      agentStatus ?? this.agentStatus,
      this.activeTicketsCount,
      this.resolvedTicketsCount,
      this.createdAt,
      new Date(),
    )
  }

  incrementActiveTickets(): AgentProfile {
    return new AgentProfile(
      this.id,
      this.tenantId,
      this.userId,
      this.isAvailable,
      this.agentStatus,
      this.activeTicketsCount + 1,
      this.resolvedTicketsCount,
      this.createdAt,
      new Date(),
    )
  }

  incrementResolvedTickets(): AgentProfile {
    return new AgentProfile(
      this.id,
      this.tenantId,
      this.userId,
      this.isAvailable,
      this.agentStatus,
      Math.max(0, this.activeTicketsCount - 1),
      this.resolvedTicketsCount + 1,
      this.createdAt,
      new Date(),
    )
  }
}
