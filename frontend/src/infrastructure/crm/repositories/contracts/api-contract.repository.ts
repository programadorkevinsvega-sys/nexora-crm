import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { ContractFilters } from "@/src/domain/crm/contracts/contract.repository"
import type { Contract, ContractCreateInput, ContractUpdateInput } from "@/src/domain/crm/contracts/contract.entity"

export const ApiContractRepository = {
  async list(filters: ContractFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Contract>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Contract>>(`/api/contracts${qs(params)}`)
  },
  async getById(id: string): Promise<Contract> {
    return api.get<Contract>(`/api/contracts/${id}`)
  },
  async create(data: ContractCreateInput): Promise<Contract> {
    return api.post<Contract>("/api/contracts", data)
  },
  async update(id: string, data: ContractUpdateInput): Promise<Contract> {
    return api.put<Contract>(`/api/contracts/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/contracts/${id}`)
  },
  async renew(id: string): Promise<Contract> {
    return api.put<Contract>(`/api/contracts/${id}/renew`, {})
  },
  async updateStatus(id: string, status: Contract["status"]): Promise<Contract> {
    return api.put<Contract>(`/api/contracts/${id}/status`, { status })
  },
}
