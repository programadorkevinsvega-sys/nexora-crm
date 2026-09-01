import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"

export interface Company {
  id: string
  tenantId: string
  name: string
  industry: string | null
  website: string | null
  taxId: string | null
  numberOfEmployees: number | null
  annualRevenue: number | null
  description: string | null
  parentCompanyId: string | null
  createdAt: string
  updatedAt: string
}

export interface CompanyCreateInput {
  tenantId: string
  name: string
  industry?: string | null
  website?: string | null
  taxId?: string | null
  numberOfEmployees?: number | null
  annualRevenue?: number | null
  description?: string | null
  parentCompanyId?: string | null
}

export interface CompanyUpdateInput {
  name?: string
  industry?: string | null
  website?: string | null
  taxId?: string | null
  numberOfEmployees?: number | null
  annualRevenue?: number | null
  description?: string | null
  parentCompanyId?: string | null
}

export interface CompanyFilters {
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export const ApiCompanyRepository = {
  async list(filters: CompanyFilters = {}, pagination?: { limit?: number; cursor?: string } | Pagination): Promise<PaginatedResult<Company>> {
    const params = { ...filters, cursor: (pagination as any)?.cursor ?? undefined, limit: (pagination as any)?.limit ?? 20 }
    return api.get<PaginatedResult<Company>>(`/api/companies${qs(params)}`)
  },
  async getById(id: string): Promise<Company> {
    return api.get<Company>(`/api/companies/${id}`)
  },
  async create(data: CompanyCreateInput): Promise<Company> {
    return api.post<Company>("/api/companies", data)
  },
  async update(id: string, data: CompanyUpdateInput): Promise<Company> {
    return api.put<Company>(`/api/companies/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/companies/${id}`)
  },
}
