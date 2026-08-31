import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { TicketReply, TicketReplyCreateInput } from "@/src/domain/crm/support-tickets/ticket-reply.entity"

export const ApiTicketReplyRepository = {
  async list(filters: { ticketId?: string } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<TicketReply>> {
    return ApiTicketReplyRepository.listByTicketId(filters.ticketId ?? '', pagination)
  },
  async listByTicketId(ticketId: string, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<TicketReply>> {
    const params = { cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    const res = await api.get<any>(`/api/tickets/${ticketId}/replies${qs(params)}`)
    const items = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
    return { data: items, nextCursor: res?.nextCursor ?? null }
  },
  async create(data: TicketReplyCreateInput): Promise<TicketReply> {
    return api.post<TicketReply>(`/api/tickets/${data.ticketId}/replies`, data)
  },
}
