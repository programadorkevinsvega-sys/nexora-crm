import type { Repository } from "../common/repositories/repository.interface"
import type { Ticket, TicketCreateInput, TicketUpdateInput } from "./ticket.entity"

export interface TicketFilters {
  tenantId?: string
  status?: string
  priority?: string
  assignedUserId?: string
  contactId?: string
  search?: string
  cursor?: string
  limit?: number
}

export type TicketRepository = Repository<Ticket, TicketCreateInput, TicketUpdateInput, TicketFilters>
