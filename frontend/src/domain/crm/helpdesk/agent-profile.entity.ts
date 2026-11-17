import { Entity } from "../common/entities/base.entity"

export interface AgentProfileProps {
  tenantId: string
  userId: string
  isAvailable: boolean
  agentStatus: string
  activeTicketsCount: number
  resolvedTicketsCount: number
}

export class AgentProfile extends Entity<AgentProfileProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get userId(): string {
    return this.props.userId
  }

  get isAvailable(): boolean {
    return this.props.isAvailable
  }

  get agentStatus(): string {
    return this.props.agentStatus
  }

  get activeTicketsCount(): number {
    return this.props.activeTicketsCount
  }

  get resolvedTicketsCount(): number {
    return this.props.resolvedTicketsCount
  }

  static create(
    props: AgentProfileCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): AgentProfile {
    return new AgentProfile(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      userId: props.userId,
      isAvailable: props.isAvailable ?? true,
      agentStatus: props.agentStatus ?? "ONLINE",
      activeTicketsCount: props.activeTicketsCount ?? 0,
      resolvedTicketsCount: props.resolvedTicketsCount ?? 0,
    })
  }

  setAvailability(available: boolean): void {
    this.props.isAvailable = available
    this.touch()
  }
}

export interface AgentProfileCreateInput {
  tenantId: string
  userId: string
  isAvailable?: boolean
  agentStatus?: string
  activeTicketsCount?: number
  resolvedTicketsCount?: number
}

export interface AgentProfileUpdateInput {
  isAvailable?: boolean
  agentStatus?: string
}
