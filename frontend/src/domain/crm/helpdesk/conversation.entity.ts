import { Entity } from "../common/entities/base.entity"

export interface ConversationProps {
  tenantId: string
  mailboxId: string
  ticketNumber: number
  subject: string
  customerEmail: string
  customerId: string | null
  assigneeUserId: string | null
  status: "OPEN" | "PENDING" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  sourceChannel: string
  previewText: string | null
  hasAttachments: boolean
  lastReplyAt: string | null
  lastReplyFrom: string | null
  closedAt: string | null
  estimatedHours: number | null
  workedHours: number | null
  dueDate: string | null
  firstResponseAt: string | null
  resolvedAt: string | null
  isInternal: boolean
  requiresApproval: boolean
}

export class Conversation extends Entity<ConversationProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get mailboxId(): string {
    return this.props.mailboxId
  }

  get ticketNumber(): number {
    return this.props.ticketNumber
  }

  get subject(): string {
    return this.props.subject
  }

  get customerEmail(): string {
    return this.props.customerEmail
  }

  get customerId(): string | null {
    return this.props.customerId
  }

  get assigneeUserId(): string | null {
    return this.props.assigneeUserId
  }

  get status(): "OPEN" | "PENDING" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED" {
    return this.props.status
  }

  get priority(): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    return this.props.priority
  }

  get sourceChannel(): string {
    return this.props.sourceChannel
  }

  get previewText(): string | null {
    return this.props.previewText
  }

  get hasAttachments(): boolean {
    return this.props.hasAttachments
  }

  get lastReplyAt(): string | null {
    return this.props.lastReplyAt
  }

  get lastReplyFrom(): string | null {
    return this.props.lastReplyFrom
  }

  get closedAt(): string | null {
    return this.props.closedAt
  }

  get estimatedHours(): number | null {
    return this.props.estimatedHours
  }

  get workedHours(): number | null {
    return this.props.workedHours
  }

  get dueDate(): string | null {
    return this.props.dueDate
  }

  get firstResponseAt(): string | null {
    return this.props.firstResponseAt
  }

  get resolvedAt(): string | null {
    return this.props.resolvedAt
  }

  get isInternal(): boolean {
    return this.props.isInternal
  }

  get requiresApproval(): boolean {
    return this.props.requiresApproval
  }

  static create(
    props: ConversationCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Conversation {
    return new Conversation(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      mailboxId: props.mailboxId,
      ticketNumber: props.ticketNumber,
      subject: props.subject,
      customerEmail: props.customerEmail,
      customerId: props.customerId ?? null,
      assigneeUserId: props.assigneeUserId ?? null,
      status: props.status ?? "OPEN",
      priority: props.priority ?? "MEDIUM",
      sourceChannel: props.sourceChannel,
      previewText: props.previewText ?? null,
      hasAttachments: props.hasAttachments ?? false,
      lastReplyAt: props.lastReplyAt ?? null,
      lastReplyFrom: props.lastReplyFrom ?? null,
      closedAt: props.closedAt ?? null,
      estimatedHours: props.estimatedHours ?? null,
      workedHours: props.workedHours ?? null,
      dueDate: props.dueDate ?? null,
      firstResponseAt: props.firstResponseAt ?? null,
      resolvedAt: props.resolvedAt ?? null,
      isInternal: props.isInternal ?? false,
      requiresApproval: props.requiresApproval ?? false,
    })
  }

  assign(userId: string): void {
    this.props.assigneeUserId = userId
    this.touch()
  }

  resolve(): void {
    this.props.status = "RESOLVED"
    this.props.resolvedAt = new Date().toISOString()
    this.touch()
  }

  close(): void {
    this.props.status = "CLOSED"
    this.props.closedAt = new Date().toISOString()
    this.touch()
  }

  update(input: ConversationUpdateInput): void {
    if (input.subject !== undefined) {
      this.props.subject = input.subject
    }
    if (input.priority !== undefined) {
      this.props.priority = input.priority
    }
    if (input.assigneeUserId !== undefined) {
      this.props.assigneeUserId = input.assigneeUserId
    }
    if (input.previewText !== undefined) {
      this.props.previewText = input.previewText
    }
    if (input.estimatedHours !== undefined) {
      this.props.estimatedHours = input.estimatedHours
    }
    if (input.workedHours !== undefined) {
      this.props.workedHours = input.workedHours
    }
    if (input.dueDate !== undefined) {
      this.props.dueDate = input.dueDate
    }
    if (input.isInternal !== undefined) {
      this.props.isInternal = input.isInternal
    }
    if (input.requiresApproval !== undefined) {
      this.props.requiresApproval = input.requiresApproval
    }
    this.touch()
  }
}

export interface ConversationCreateInput {
  tenantId: string
  mailboxId: string
  ticketNumber: number
  subject: string
  customerEmail: string
  sourceChannel: string
  customerId?: string | null
  assigneeUserId?: string | null
  status?: "OPEN" | "PENDING" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED"
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  previewText?: string | null
  hasAttachments?: boolean
  lastReplyAt?: string | null
  lastReplyFrom?: string | null
  closedAt?: string | null
  estimatedHours?: number | null
  workedHours?: number | null
  dueDate?: string | null
  firstResponseAt?: string | null
  resolvedAt?: string | null
  isInternal?: boolean
  requiresApproval?: boolean
}

export interface ConversationUpdateInput {
  subject?: string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  assigneeUserId?: string | null
  previewText?: string | null
  estimatedHours?: number | null
  workedHours?: number | null
  dueDate?: string | null
  isInternal?: boolean
  requiresApproval?: boolean
}
