import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"

export interface AffiliateProgram {
  id: string
  tenantId: string
  name: string
  commissionType: string
  commissionRate: number
  cookieDays: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AffiliateProgramCreateInput {
  tenantId: string
  name: string
  commissionType: string
  commissionRate: number
  cookieDays?: number
  isActive?: boolean
}

export interface AffiliateProgramUpdateInput {
  name?: string
  commissionType?: string
  commissionRate?: number
  cookieDays?: number
  isActive?: boolean
}

export interface Affiliate {
  id: string
  tenantId: string
  programId: string
  contactId: string
  referralCode: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface AffiliateCreateInput {
  tenantId: string
  programId: string
  contactId: string
  referralCode: string
}

export interface Commission {
  id: string
  tenantId: string
  affiliateId: string
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Payout {
  id: string
  tenantId: string
  affiliateId: string
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export const ApiAffiliateRepository = {
  async list(filters: { programId?: string; status?: string; tenantId?: string; search?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Affiliate>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Affiliate>>(`/api/affiliates${qs(params)}`)
  },
  async getById(id: string): Promise<Affiliate> {
    return api.get<Affiliate>(`/api/affiliates/${id}`)
  },
  async create(data: AffiliateCreateInput): Promise<Affiliate> {
    return api.post<Affiliate>("/api/affiliates", data)
  },
  async update(id: string, data: any): Promise<any> {
    return Promise.resolve({ id, ...data })
  },
  async delete(_id: string): Promise<void> {
    return Promise.resolve()
  },

  async listPrograms(filters: { isActive?: boolean; tenantId?: string; search?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<AffiliateProgram>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<AffiliateProgram>>(`/api/affiliates/programs${qs(params)}`)
  },
  async getProgramById(id: string): Promise<AffiliateProgram> {
    return api.get<AffiliateProgram>(`/api/affiliates/programs/${id}`)
  },
  async createProgram(data: AffiliateProgramCreateInput): Promise<AffiliateProgram> {
    return api.post<AffiliateProgram>("/api/affiliates/programs", data)
  },
  async updateProgram(id: string, data: AffiliateProgramUpdateInput): Promise<AffiliateProgram> {
    return api.put<AffiliateProgram>(`/api/affiliates/programs/${id}`, data)
  },
  async deleteProgram(id: string): Promise<void> {
    return api.delete(`/api/affiliates/programs/${id}`)
  },

  async listAffiliates(filters: { programId?: string; status?: string; tenantId?: string; search?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Affiliate>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Affiliate>>(`/api/affiliates${qs(params)}`)
  },
  async getAffiliateById(id: string): Promise<Affiliate> {
    return api.get<Affiliate>(`/api/affiliates/${id}`)
  },
  async createAffiliate(data: AffiliateCreateInput): Promise<Affiliate> {
    return api.post<Affiliate>("/api/affiliates", data)
  },

  async listCommissions(filters: { affiliateId?: string; status?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Commission>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Commission>>(`/api/affiliates/commissions${qs(params)}`)
  },

  async listPayouts(filters: { affiliateId?: string; status?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Payout>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Payout>>(`/api/affiliates/payouts${qs(params)}`)
  },
}

export const ApiAffiliateProgramRepository = {
  async list(filters: { isActive?: boolean; tenantId?: string; search?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<AffiliateProgram>> {
    return ApiAffiliateRepository.listPrograms(filters, pagination)
  },
  async getById(id: string): Promise<AffiliateProgram> {
    return ApiAffiliateRepository.getProgramById(id)
  },
  async create(data: AffiliateProgramCreateInput): Promise<AffiliateProgram> {
    return ApiAffiliateRepository.createProgram(data)
  },
  async update(id: string, data: AffiliateProgramUpdateInput): Promise<AffiliateProgram> {
    return ApiAffiliateRepository.updateProgram(id, data)
  },
  async delete(id: string): Promise<void> {
    return ApiAffiliateRepository.deleteProgram(id)
  },
}

export const ApiCommissionRepository = {
  async listByAffiliateId(affiliateId: string, filters: { status?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Commission>> {
    return ApiAffiliateRepository.listCommissions({ ...filters, affiliateId }, pagination)
  },
  async create(data: any): Promise<Commission> {
    return api.post<Commission>("/api/affiliates/commissions", data)
  },
}

export const ApiPayoutRepository = {
  async listByAffiliateId(affiliateId: string, filters: { status?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Payout>> {
    return ApiAffiliateRepository.listPayouts({ ...filters, affiliateId }, pagination)
  },
  async create(data: any): Promise<Payout> {
    return api.post<Payout>("/api/affiliates/payouts", data)
  },
}
