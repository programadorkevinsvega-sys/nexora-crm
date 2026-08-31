import { Entity } from "../common/entities/base.entity"

export interface TicketProps {
  tenantId: string
  contactId: string | null
  subject: string
  description: string
  status: "OPEN" | "PENDING" | "RESOLVED" | "CLOSED"
  priority: string
  assignedUserId: string | null
  slaId: string | null
  firstResponseAt: string | null
  slaBreachAt: string | null
  isEscalated: boolean
}

export class Ticket extends Entity<TicketProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get contactId(): string | null {
    return this.props.contactId
  }

  get subject(): string {
    return this.props.subject
  }

  get description(): string {
    return this.props.description
  }

  get status(): "OPEN" | "PENDING" | "RESOLVED" | "CLOSED" {
    return this.props.status
  }

  get priority(): string {
    return this.props.priority
  }

  get assignedUserId(): string | null {
    return this.props.assignedUserId
  }

  get slaId(): string | null {
    return this.props.slaId
  }

  get firstResponseAt(): string | null {
    return this.props.firstResponseAt
  }

  get slaBreachAt(): string | null {
    return this.props.slaBreachAt
  }

  get isEscalated(): boolean {
    return this.props.isEscalated
  }

  static create(
    props: TicketCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Ticket {
    return new Ticket(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      contactId: props.contactId ?? null,
      subject: props.subject,
      description: props.description,
      status: props.status ?? "OPEN",
      priority: props.priority,
      assignedUserId: props.assignedUserId ?? null,
      slaId: props.slaId ?? null,
      firstResponseAt: props.firstResponseAt ?? null,
      slaBreachAt: props.slaBreachAt ?? null,
      isEscalated: props.isEscalated ?? false,
    })
  }

  assign(userId: string): void {
    this.props.assignedUserId = userId
    this.touch()
  }

  resolve(): void {
    this.props.status = "RESOLVED"
    this.touch()
  }

  escalate(): void {
    this.props.isEscalated = true
    this.touch()
  }

  update(input: TicketUpdateInput): void {
    if (input.subject !== undefined) {
      this.props.subject = input.subject
    }
    if (input.description !== undefined) {
      this.props.description = input.description
    }
    if (input.status !== undefined) {
      this.props.status = input.status
    }
    if (input.priority !== undefined) {
      this.props.priority = input.priority
    }
    if (input.assignedUserId !== undefined) {
      this.props.assignedUserId = input.assignedUserId
    }
    if (input.firstResponseAt !== undefined) {
      this.props.firstResponseAt = input.firstResponseAt
    }
    if (input.slaBreachAt !== undefined) {
      this.props.slaBreachAt = input.slaBreachAt
    }
    this.touch()
  }
}

export interface TicketCreateInput {
  tenantId: string
  subject: string
  description: string
  priority: string
  contactId?: string | null
  status?: "OPEN" | "PENDING" | "RESOLVED" | "CLOSED"
  assignedUserId?: string | null
  slaId?: string | null
  firstResponseAt?: string | null
  slaBreachAt?: string | null
  isEscalated?: boolean
}

export interface TicketUpdateInput {
  subject?: string
  description?: string
  status?: "OPEN" | "PENDING" | "RESOLVED" | "CLOSED"
  priority?: string
  assignedUserId?: string | null
  firstResponseAt?: string | null
  slaBreachAt?: string | null
}
