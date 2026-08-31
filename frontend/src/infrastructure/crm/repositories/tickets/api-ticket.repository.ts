import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { TicketFilters } from "@/src/domain/crm/support-tickets/ticket.repository"
import type { Ticket, TicketCreateInput, TicketUpdateInput } from "@/src/domain/crm/support-tickets/ticket.entity"

export const ApiTicketRepository = {
  async list(filters: TicketFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Ticket>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Ticket>>(`/api/tickets${qs(params)}`)
  },
  async getById(id: string): Promise<Ticket> {
    return api.get<Ticket>(`/api/tickets/${id}`)
  },
  async create(data: TicketCreateInput): Promise<Ticket> {
    return api.post<Ticket>("/api/tickets", data)
  },
  async update(id: string, data: TicketUpdateInput): Promise<Ticket> {
    return api.put<Ticket>(`/api/tickets/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/tickets/${id}`)
  },
  async updateStatus(id: string, status: Ticket["status"]): Promise<Ticket> {
    return api.put<Ticket>(`/api/tickets/${id}/status`, { status })
  },
  async assign(id: string, assignedUserId: string): Promise<Ticket> {
    return api.put<Ticket>(`/api/tickets/${id}/assign`, { assignedUserId })
  },
}
