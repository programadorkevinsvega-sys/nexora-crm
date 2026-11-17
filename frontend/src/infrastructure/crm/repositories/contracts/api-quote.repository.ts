import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { QuoteFilters } from "@/src/domain/crm/contracts/quote.repository"
import type { Quote, QuoteCreateInput } from "@/src/domain/crm/contracts/quote.entity"

export const ApiQuoteRepository = {
  async list(filters: QuoteFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Quote>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Quote>>(`/api/quotes${qs(params)}`)
  },
  async getById(id: string): Promise<Quote> {
    return api.get<Quote>(`/api/quotes/${id}`)
  },
  async create(data: QuoteCreateInput): Promise<Quote> {
    return api.post<Quote>("/api/quotes", data)
  },
  async update(id: string, _data: Record<string, never>): Promise<Quote> {
    return api.put<Quote>(`/api/quotes/${id}`, _data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/quotes/${id}`)
  },
  async send(id: string): Promise<Quote> {
    return api.put<Quote>(`/api/quotes/${id}/send`, {})
  },
  async accept(id: string): Promise<Quote> {
    return api.put<Quote>(`/api/quotes/${id}/accept`, {})
  },
  async reject(id: string): Promise<Quote> {
    return api.put<Quote>(`/api/quotes/${id}/reject`, {})
  },
}
