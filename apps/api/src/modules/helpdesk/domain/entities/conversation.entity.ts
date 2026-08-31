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

  static create(props: {
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
  }): HelpdeskConversation {
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

  assign(userId: string): HelpdeskConversation {
    return new HelpdeskConversation(
      this.id,
      this.tenantId,
      this.mailboxId,
      this.ticketNumber,
      this.subject,
      this.customerEmail,
      this.customerId,
      userId,
      this.status,
      this.priority,
      this.sourceChannel,
      this.previewText,
      this.hasAttachments,
      this.lastReplyAt,
      this.lastReplyFrom,
      this.closedAt,
      this.estimatedHours,
      this.workedHours,
      this.dueDate,
      this.firstResponseAt,
      this.resolvedAt,
      this.isInternal,
      this.requiresApproval,
      this.createdAt,
      new Date(),
    )
  }

  changeStatus(status: string): HelpdeskConversation {
    return new HelpdeskConversation(
      this.id,
      this.tenantId,
      this.mailboxId,
      this.ticketNumber,
      this.subject,
      this.customerEmail,
      this.customerId,
      this.assigneeUserId,
      status,
      this.priority,
      this.sourceChannel,
      this.previewText,
      this.hasAttachments,
      this.lastReplyAt,
      this.lastReplyFrom,
      status === 'CLOSED' ? new Date() : this.closedAt,
      this.estimatedHours,
      this.workedHours,
      this.dueDate,
      this.firstResponseAt ?? (status === 'WAITING_ON_CUSTOMER' ? new Date() : this.firstResponseAt),
      status === 'RESOLVED' ? new Date() : this.resolvedAt,
      this.isInternal,
      this.requiresApproval,
      this.createdAt,
      new Date(),
    )
  }

  resolve(): HelpdeskConversation {
    return new HelpdeskConversation(
      this.id,
      this.tenantId,
      this.mailboxId,
      this.ticketNumber,
      this.subject,
      this.customerEmail,
      this.customerId,
      this.assigneeUserId,
      'RESOLVED',
      this.priority,
      this.sourceChannel,
      this.previewText,
      this.hasAttachments,
      this.lastReplyAt,
      this.lastReplyFrom,
      null,
      this.estimatedHours,
      this.workedHours,
      this.dueDate,
      this.firstResponseAt,
      new Date(),
      this.isInternal,
      this.requiresApproval,
      this.createdAt,
      new Date(),
    )
  }

  addThread(props: {
    previewText?: string
    hasAttachments?: boolean
    lastReplyAt?: Date
    lastReplyFrom?: string
  }): HelpdeskConversation {
    return new HelpdeskConversation(
      this.id,
      this.tenantId,
      this.mailboxId,
      this.ticketNumber,
      this.subject,
      this.customerEmail,
      this.customerId,
      this.assigneeUserId,
      this.status,
      this.priority,
      this.sourceChannel,
      props.previewText ?? this.previewText,
      props.hasAttachments ?? this.hasAttachments,
      props.lastReplyAt ?? this.lastReplyAt,
      props.lastReplyFrom ?? this.lastReplyFrom,
      this.closedAt,
      this.estimatedHours,
      this.workedHours,
      this.dueDate,
      this.firstResponseAt,
      this.resolvedAt,
      this.isInternal,
      this.requiresApproval,
      this.createdAt,
      new Date(),
    )
  }

  updateWorkedHours(hours: number): HelpdeskConversation {
    return new HelpdeskConversation(
      this.id,
      this.tenantId,
      this.mailboxId,
      this.ticketNumber,
      this.subject,
      this.customerEmail,
      this.customerId,
      this.assigneeUserId,
      this.status,
      this.priority,
      this.sourceChannel,
      this.previewText,
      this.hasAttachments,
      this.lastReplyAt,
      this.lastReplyFrom,
      this.closedAt,
      this.estimatedHours,
      hours,
      this.dueDate,
      this.firstResponseAt,
      this.resolvedAt,
      this.isInternal,
      this.requiresApproval,
      this.createdAt,
      new Date(),
    )
  }
}
