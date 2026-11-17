import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { SalesTeamFilters } from "@/src/domain/crm/sales-teams/sales-team.repository"
import type { SalesTeam, SalesTeamCreateInput, SalesTeamUpdateInput } from "@/src/domain/crm/sales-teams/sales-team.entity"
import type { SalesQuota, SalesQuotaCreateInput } from "@/src/domain/crm/sales-teams/sales-quota.entity"

export const ApiSalesTeamRepository = {
  async list(filters: SalesTeamFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<SalesTeam>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<SalesTeam>>(`/api/sales-teams${qs(params)}`)
  },
  async getById(id: string): Promise<SalesTeam> {
    return api.get<SalesTeam>(`/api/sales-teams/${id}`)
  },
  async create(data: SalesTeamCreateInput): Promise<SalesTeam> {
    return api.post<SalesTeam>("/api/sales-teams", data)
  },
  async update(id: string, data: SalesTeamUpdateInput): Promise<SalesTeam> {
    return api.put<SalesTeam>(`/api/sales-teams/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/sales-teams/${id}`)
  },
  async listQuotas(teamId: string, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<SalesQuota>> {
    const params = { cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<SalesQuota>>(`/api/sales-teams/${teamId}/quotas${qs(params)}`)
  },
  async createQuota(teamId: string, data: SalesQuotaCreateInput): Promise<SalesQuota> {
    return api.post<SalesQuota>(`/api/sales-teams/${teamId}/quotas`, data)
  },
  async addMember(teamId: string, userId: string): Promise<void> {
    return api.post(`/api/sales-teams/${teamId}/members`, { userId })
  },
  async removeMember(teamId: string, userId: string): Promise<void> {
    return api.delete(`/api/sales-teams/${teamId}/members/${userId}`)
  },
}
