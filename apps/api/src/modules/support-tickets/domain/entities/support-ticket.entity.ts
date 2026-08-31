export type TicketStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export class SupportTicket {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string | null,
    readonly subject: string,
    readonly description: string,
    readonly status: TicketStatus,
    readonly priority: TicketPriority,
    readonly assignedUserId: string | null,
    readonly slaId: string | null,
    readonly firstResponseAt: Date | null,
    readonly slaBreachAt: Date | null,
    readonly isEscalated: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    contactId?: string
    subject: string
    description: string
    priority?: TicketPriority
    assignedUserId?: string
    slaId?: string
  }): SupportTicket {
    return new SupportTicket(
      crypto.randomUUID(),
      props.tenantId,
      props.contactId ?? null,
      props.subject,
      props.description,
      'OPEN',
      props.priority ?? 'MEDIUM',
      props.assignedUserId ?? null,
      props.slaId ?? null,
      null,
      null,
      false,
      new Date(),
      new Date(),
    )
  }

  updateStatus(newStatus: TicketStatus): SupportTicket {
    return new SupportTicket(
      this.id,
      this.tenantId,
      this.contactId,
      this.subject,
      this.description,
      newStatus,
      this.priority,
      this.assignedUserId,
      this.slaId,
      newStatus === 'RESOLVED' || newStatus === 'CLOSED' ? (this.firstResponseAt ?? new Date()) : this.firstResponseAt,
      this.slaBreachAt,
      this.isEscalated,
      this.createdAt,
      new Date(),
    )
  }

  assign(userId: string): SupportTicket {
    return new SupportTicket(
      this.id,
      this.tenantId,
      this.contactId,
      this.subject,
      this.description,
      this.status,
      this.priority,
      userId,
      this.slaId,
      this.firstResponseAt,
      this.slaBreachAt,
      this.isEscalated,
      this.createdAt,
      new Date(),
    )
  }

  escalate(): SupportTicket {
    return new SupportTicket(
      this.id,
      this.tenantId,
      this.contactId,
      this.subject,
      this.description,
      this.status,
      this.priority,
      this.assignedUserId,
      this.slaId,
      this.firstResponseAt,
      this.slaBreachAt,
      true,
      this.createdAt,
      new Date(),
    )
  }
}
