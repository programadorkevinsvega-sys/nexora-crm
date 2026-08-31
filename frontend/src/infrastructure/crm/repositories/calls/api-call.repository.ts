import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { CallFilters } from "@/src/domain/crm/calls/call.repository"
import type { Call, CallCreateInput, CallUpdateInput } from "@/src/domain/crm/calls/call.entity"

export const ApiCallRepository = {
  async list(filters: CallFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Call>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Call>>(`/api/calls${qs(params)}`)
  },
  async getById(id: string): Promise<Call> {
    return api.get<Call>(`/api/calls/${id}`)
  },
  async create(data: CallCreateInput): Promise<Call> {
    return api.post<Call>("/api/calls", data)
  },
  async update(id: string, data: CallUpdateInput): Promise<Call> {
    return api.put<Call>(`/api/calls/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/calls/${id}`)
  },
}
