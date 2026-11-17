import { SupportTicket, TicketStatus, TicketPriority } from '../entities/support-ticket.entity'

export interface TicketFilter {
  status?: TicketStatus
  priority?: TicketPriority
  assignedUserId?: string
  contactId?: string
  search?: string
  cursor?: string
  limit: number
}

export interface PaginatedTickets {
  data: SupportTicket[]
  nextCursor: string | null
}

export abstract class TicketRepository {
  abstract findById(tenantId: string, id: string): Promise<SupportTicket | null>
  abstract findByTenantId(tenantId: string): Promise<SupportTicket[]>
  abstract list(tenantId: string, filter: TicketFilter): Promise<PaginatedTickets>
  abstract save(ticket: SupportTicket): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
