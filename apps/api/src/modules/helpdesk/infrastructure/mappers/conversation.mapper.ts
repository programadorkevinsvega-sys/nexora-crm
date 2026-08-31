import { HelpdeskConversation } from '../../domain/entities/conversation.entity'

type ConversationRow = {
  id: string
  tenantId: string
  mailboxId: string
  ticketNumber: number | null
  subject: string
  customerEmail: string
  customerId: string | null
  assigneeUserId: string | null
  status: string | null
  priority: string | null
  sourceChannel: string | null
  previewText: string | null
  hasAttachments: boolean | null
  lastReplyAt: Date | null
  lastReplyFrom: string | null
  closedAt: Date | null
  estimatedHours: string | null
  workedHours: string | null
  dueDate: Date | null
  firstResponseAt: Date | null
  resolvedAt: Date | null
  isInternal: boolean | null
  requiresApproval: boolean | null
  createdAt: Date
  updatedAt: Date
}

export class ConversationMapper {
  static toDomain(row: ConversationRow): HelpdeskConversation {
    return new HelpdeskConversation(
      row.id,
      row.tenantId,
      row.mailboxId,
      row.ticketNumber,
      row.subject,
      row.customerEmail,
      row.customerId,
      row.assigneeUserId,
      row.status ?? "OPEN",
      row.priority ?? "NORMAL",
      row.sourceChannel ?? "",
      row.previewText,
      row.hasAttachments ?? false,
      row.lastReplyAt,
      row.lastReplyFrom,
      row.closedAt,
      row.estimatedHours ? Number(row.estimatedHours) : null,
      row.workedHours ? Number(row.workedHours) : null,
      row.dueDate,
      row.firstResponseAt,
      row.resolvedAt,
      row.isInternal ?? false,
      row.requiresApproval ?? false,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(conversation: HelpdeskConversation): ConversationRow {
    return {
      id: conversation.id,
      tenantId: conversation.tenantId,
      mailboxId: conversation.mailboxId,
      ticketNumber: conversation.ticketNumber ?? null,
      subject: conversation.subject,
      customerEmail: conversation.customerEmail,
      customerId: conversation.customerId,
      assigneeUserId: conversation.assigneeUserId,
      status: conversation.status,
      priority: conversation.priority,
      sourceChannel: conversation.sourceChannel,
      previewText: conversation.previewText,
      hasAttachments: conversation.hasAttachments,
      lastReplyAt: conversation.lastReplyAt,
      lastReplyFrom: conversation.lastReplyFrom,
      closedAt: conversation.closedAt,
      estimatedHours: conversation.estimatedHours?.toString() ?? null,
      workedHours: conversation.workedHours?.toString() ?? null,
      dueDate: conversation.dueDate,
      firstResponseAt: conversation.firstResponseAt,
      resolvedAt: conversation.resolvedAt,
      isInternal: conversation.isInternal,
      requiresApproval: conversation.requiresApproval,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }
  }

  static toResponse(conversation: HelpdeskConversation) {
    return {
      id: conversation.id,
      tenantId: conversation.tenantId,
      mailboxId: conversation.mailboxId,
      ticketNumber: conversation.ticketNumber ?? null,
      subject: conversation.subject,
      customerEmail: conversation.customerEmail,
      customerId: conversation.customerId,
      assigneeUserId: conversation.assigneeUserId,
      status: conversation.status,
      priority: conversation.priority,
      sourceChannel: conversation.sourceChannel,
      previewText: conversation.previewText,
      hasAttachments: conversation.hasAttachments,
      lastReplyAt: conversation.lastReplyAt?.toISOString() ?? null,
      lastReplyFrom: conversation.lastReplyFrom,
      closedAt: conversation.closedAt?.toISOString() ?? null,
      estimatedHours: conversation.estimatedHours,
      workedHours: conversation.workedHours,
      dueDate: conversation.dueDate?.toISOString() ?? null,
      firstResponseAt: conversation.firstResponseAt?.toISOString() ?? null,
      resolvedAt: conversation.resolvedAt?.toISOString() ?? null,
      isInternal: conversation.isInternal,
      requiresApproval: conversation.requiresApproval,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    }
  }
}
