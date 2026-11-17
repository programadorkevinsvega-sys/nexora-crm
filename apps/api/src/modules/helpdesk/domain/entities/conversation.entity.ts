export interface CreateConversationProps {
  tenantId: string
  mailboxId: string
  subject: string
  customerEmail: string
  customerId?: string
  assigneeUserId?: string
  status?: string
  priority?: string
  sourceChannel?: string
  previewText?: string
  estimatedHours?: number
  dueDate?: Date
  isInternal?: boolean
  requiresApproval?: boolean
}

export class HelpdeskConversation {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly mailboxId: string,
    readonly ticketNumber: number | null,
    readonly subject: string,
    readonly customerEmail: string,
    readonly customerId: string | null,
    readonly assigneeUserId: string | null,
    readonly status: string,
    readonly priority: string,
    readonly sourceChannel: string,
    readonly previewText: string | null,
    readonly hasAttachments: boolean,
    readonly lastReplyAt: Date | null,
    readonly lastReplyFrom: string | null,
    readonly closedAt: Date | null,
    readonly estimatedHours: number | null,
    readonly workedHours: number | null,
    readonly dueDate: Date | null,
    readonly firstResponseAt: Date | null,
    readonly resolvedAt: Date | null,
    readonly isInternal: boolean,
    readonly requiresApproval: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: CreateConversationProps): HelpdeskConversation {
    return new HelpdeskConversation(
      crypto.randomUUID(),
      props.tenantId,
      props.mailboxId,
      null,
      props.subject,
      props.customerEmail,
      props.customerId ?? null,
      props.assigneeUserId ?? null,
      props.status ?? 'OPEN',
      props.priority ?? 'NORMAL',
      props.sourceChannel ?? 'EMAIL',
      props.previewText ?? null,
      false,
      null,
      null,
      null,
      props.estimatedHours ?? null,
      null,
      props.dueDate ?? null,
      null,
      null,
      props.isInternal ?? false,
      props.requiresApproval ?? false,
      new Date(),
      new Date(),
    )
  }

  private clone(overrides: Partial<Record<keyof HelpdeskConversation, any>>): HelpdeskConversation {
    return new HelpdeskConversation(
      overrides.id ?? this.id,
      overrides.tenantId ?? this.tenantId,
      overrides.mailboxId ?? this.mailboxId,
      overrides.ticketNumber !== undefined ? overrides.ticketNumber : this.ticketNumber,
      overrides.subject ?? this.subject,
      overrides.customerEmail ?? this.customerEmail,
      overrides.customerId !== undefined ? overrides.customerId : this.customerId,
      overrides.assigneeUserId !== undefined ? overrides.assigneeUserId : this.assigneeUserId,
      overrides.status ?? this.status,
      overrides.priority ?? this.priority,
      overrides.sourceChannel ?? this.sourceChannel,
      overrides.previewText !== undefined ? overrides.previewText : this.previewText,
      overrides.hasAttachments !== undefined ? overrides.hasAttachments : this.hasAttachments,
      overrides.lastReplyAt !== undefined ? overrides.lastReplyAt : this.lastReplyAt,
      overrides.lastReplyFrom !== undefined ? overrides.lastReplyFrom : this.lastReplyFrom,
      overrides.closedAt !== undefined ? overrides.closedAt : this.closedAt,
      overrides.estimatedHours !== undefined ? overrides.estimatedHours : this.estimatedHours,
      overrides.workedHours !== undefined ? overrides.workedHours : this.workedHours,
      overrides.dueDate !== undefined ? overrides.dueDate : this.dueDate,
      overrides.firstResponseAt !== undefined ? overrides.firstResponseAt : this.firstResponseAt,
      overrides.resolvedAt !== undefined ? overrides.resolvedAt : this.resolvedAt,
      overrides.isInternal !== undefined ? overrides.isInternal : this.isInternal,
      overrides.requiresApproval !== undefined ? overrides.requiresApproval : this.requiresApproval,
      this.createdAt,
      new Date(),
    )
  }

  assign(userId: string): HelpdeskConversation {
    return this.clone({ assigneeUserId: userId })
  }

  changeStatus(status: string): HelpdeskConversation {
    return this.clone({
      status,
      closedAt: status === 'CLOSED' ? new Date() : this.closedAt,
      firstResponseAt: this.firstResponseAt ?? (status === 'WAITING_ON_CUSTOMER' ? new Date() : this.firstResponseAt),
      resolvedAt: status === 'RESOLVED' ? new Date() : this.resolvedAt,
    })
  }

  resolve(): HelpdeskConversation {
    return this.clone({ status: 'RESOLVED', closedAt: null, resolvedAt: new Date() })
  }

  addThread(props: {
    previewText?: string
    hasAttachments?: boolean
    lastReplyAt?: Date
    lastReplyFrom?: string
  }): HelpdeskConversation {
    return this.clone({
      previewText: props.previewText ?? this.previewText,
      hasAttachments: props.hasAttachments ?? this.hasAttachments,
      lastReplyAt: props.lastReplyAt ?? this.lastReplyAt,
      lastReplyFrom: props.lastReplyFrom ?? this.lastReplyFrom,
    })
  }

  updateWorkedHours(hours: number): HelpdeskConversation {
    return this.clone({ workedHours: hours })
  }
}
