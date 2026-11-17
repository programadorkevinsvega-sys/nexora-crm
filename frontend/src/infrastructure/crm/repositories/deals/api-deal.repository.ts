import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"

export interface Deal {
  id: string
  tenantId: string
  pipelineId: string
  stageId: string
  name: string
  value: number | null
  currency: string | null
  probability: number | null
  status: string
  contactId: string | null
  companyId: string | null
  ownerUserId: string | null
  closeDate: string | null
  createdAt: string
  updatedAt: string
}

export interface DealCreateInput {
  tenantId: string
  pipelineId: string
  stageId: string
  name: string
  amount?: number
  currency?: string | null
  probabilityOverride?: number | null
  forecastCategory?: "PIPELINE" | "BEST_CASE" | "COMMIT" | "CLOSED"
  contactId?: string | null
  companyId?: string | null
  assignedUserId?: string | null
  expectedCloseDate?: string | null
}

export interface DealUpdateInput {
  name?: string
  stageId?: string
  amount?: number
  currency?: string | null
  probabilityOverride?: number | null
  forecastCategory?: "PIPELINE" | "BEST_CASE" | "COMMIT" | "CLOSED"
  contactId?: string | null
  companyId?: string | null
  assignedUserId?: string | null
  expectedCloseDate?: string | null
}

export interface DealFilters {
  pipelineId?: string
  stageId?: string
  status?: string
  ownerUserId?: string
  cursor?: string
  limit?: number
}

export const ApiDealRepository = {
  async list(filters: DealFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Deal>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Deal>>(`/api/pipelines/deals${qs(params)}`)
  },
  async getById(id: string): Promise<Deal> {
    return api.get<Deal>(`/api/pipelines/deals/${id}`)
  },
  async create(data: DealCreateInput): Promise<Deal> {
    return api.post<Deal>("/api/pipelines/deals", data)
  },
  async update(id: string, data: DealUpdateInput): Promise<Deal> {
    return api.put<Deal>(`/api/pipelines/deals/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/pipelines/deals/${id}`)
  },
  async move(id: string, stageId: string): Promise<Deal> {
    return api.put<Deal>(`/api/pipelines/deals/${id}/move`, { stageId })
  },
  async win(id: string): Promise<Deal> {
    return api.put<Deal>(`/api/pipelines/deals/${id}/win`, {})
  },
  async lose(id: string): Promise<Deal> {
    return api.put<Deal>(`/api/pipelines/deals/${id}/lose`, {})
  },
}
