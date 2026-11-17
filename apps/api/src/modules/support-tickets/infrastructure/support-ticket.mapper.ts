import { SupportTicket, TicketStatus, TicketPriority } from '../domain/entities/support-ticket.entity'
import { TicketReply, AuthorType } from '../domain/entities/ticket-reply.entity'

type TicketRow = {
  id: string
  tenantId: string
  contactId: string | null
  subject: string
  description: string
  status: string | null
  priority: string | null
  assignedUserId: string | null
  slaId: string | null
  firstResponseAt: Date | null
  slaBreachAt: Date | null
  isEscalated: Date | null
  createdAt: Date
  updatedAt: Date
}

type ReplyRow = {
  id: string
  tenantId: string
  ticketId: string
  authorType: string
  authorId: string
  message: string
  isInternalNote: boolean | null
  createdAt: Date
}

export class SupportTicketMapper {
  static toDomain(row: TicketRow): SupportTicket {
    return new SupportTicket(
      row.id,
      row.tenantId,
      row.contactId,
      row.subject,
      row.description,
      row.status as TicketStatus,
      row.priority as TicketPriority,
      row.assignedUserId,
      row.slaId,
      row.firstResponseAt,
      row.slaBreachAt,
      row.isEscalated !== null,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(ticket: SupportTicket): TicketRow {
    return {
      id: ticket.id,
      tenantId: ticket.tenantId,
      contactId: ticket.contactId,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assignedUserId: ticket.assignedUserId,
      slaId: ticket.slaId,
      firstResponseAt: ticket.firstResponseAt,
      slaBreachAt: ticket.slaBreachAt,
      isEscalated: ticket.isEscalated ? new Date() : null,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }
  }

  static toResponse(ticket: SupportTicket) {
    return {
      id: ticket.id,
      contactId: ticket.contactId,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assignedUserId: ticket.assignedUserId,
      slaId: ticket.slaId,
      firstResponseAt: ticket.firstResponseAt?.toISOString() ?? null,
      slaBreachAt: ticket.slaBreachAt?.toISOString() ?? null,
      isEscalated: ticket.isEscalated,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    }
  }

  static replyToDomain(row: ReplyRow): TicketReply {
    return new TicketReply(
      row.id,
      row.tenantId,
      row.ticketId,
      row.authorType as AuthorType,
      row.authorId,
      row.message,
      row.isInternalNote ?? false,
      row.createdAt,
    )
  }

  static replyToPersistence(reply: TicketReply): ReplyRow {
    return {
      id: reply.id,
      tenantId: reply.tenantId,
      ticketId: reply.ticketId,
      authorType: reply.authorType,
      authorId: reply.authorId,
      message: reply.message,
      isInternalNote: reply.isInternalNote || null,
      createdAt: reply.createdAt,
    }
  }

  static replyToResponse(reply: TicketReply) {
    return {
      id: reply.id,
      ticketId: reply.ticketId,
      authorType: reply.authorType,
      authorId: reply.authorId,
      message: reply.message,
      isInternalNote: reply.isInternalNote,
      createdAt: reply.createdAt.toISOString(),
    }
  }
}
