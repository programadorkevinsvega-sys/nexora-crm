import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"

export interface AffiliateProgram {
  id: string
  tenantId: string
  name: string
  commissionType: string
  commissionValue: number
  cookieDurationDays: number | null
  isMultiLevel: boolean | null
  maxMlmLevels: number | null
  isActive: boolean | null
  createdAt: string
  updatedAt: string
}

export interface AffiliateProgramCreateInput {
  tenantId: string
  name: string
  commissionType: string
  commissionValue: number
  cookieDurationDays?: number
  isMultiLevel?: boolean
  maxMlmLevels?: number
  isActive?: boolean
}

export interface AffiliateProgramUpdateInput {
  name?: string
  commissionType?: string
  commissionValue?: number
  cookieDurationDays?: number
  isMultiLevel?: boolean
  maxMlmLevels?: number
  isActive?: boolean
}

export interface Affiliate {
  id: string
  tenantId: string
  programId: string
  customerId: string
  referralCode: string
  referralLink: string
  parentAffiliateId: string | null
  mlmLevel: number | null
  status: string | null
  totalEarnings: number | null
  createdAt: string
  updatedAt: string
  commissions?: Commission[]
  payouts?: Payout[]
}

export interface AffiliateCreateInput {
  tenantId: string
  programId: string
  customerId: string
  referralCode: string
  referralLink: string
  parentAffiliateId?: string
  mlmLevel?: number
  status?: string
}

export interface Commission {
  id: string
  affiliateId: string
  sourceOrderId: string
  commissionAmount: number
  mlmLevelEarned: number | null
  status: string | null
  approvedAt: string | null
  createdAt: string
}

export interface CommissionCreateInput {
  affiliateId: string
  sourceOrderId: string
  commissionAmount: number
  mlmLevelEarned?: number
  status?: string
}

export interface Payout {
  id: string
  affiliateId: string
  amount: number
  paymentMethod: string | null
  paymentReference: string | null
  status: string | null
  paidAt: string | null
  createdAt: string
}

export interface PayoutCreateInput {
  affiliateId: string
  amount: number
  paymentMethod?: string
  paymentReference?: string
  status?: string
}

export const ApiAffiliateRepository = {
  async list(filters: { programId?: string; status?: string; tenantId?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Affiliate>> {
    const params = { programId: filters.programId, status: filters.status, cursor: pagination?.cursor ?? filters.cursor, limit: pagination?.limit ?? filters.limit ?? 20 }
    return api.get<PaginatedResult<Affiliate>>(`/api/affiliates${qs(params)}`)
  },

  async getById(id: string): Promise<Affiliate> {
    return api.get<Affiliate>(`/api/affiliates/${id}`)
  },

  async create(data: AffiliateCreateInput): Promise<Affiliate> {
    const { tenantId: _tenantId, ...request } = data
    return api.post<Affiliate>("/api/affiliates", request)
  },

  async update(_id: string, _data: Record<string, never>): Promise<Affiliate> {
    throw new Error('Affiliate update is not implemented by the current API')
  },

  async delete(_id: string): Promise<void> {
    throw new Error('Affiliate deletion is not implemented by the current API')
  },

  async listPrograms(filters: { isActive?: boolean; tenantId?: string; search?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<AffiliateProgram>> {
    const params = { search: filters.search, isActive: filters.isActive, cursor: pagination?.cursor ?? filters.cursor, limit: pagination?.limit ?? filters.limit ?? 20 }
    return api.get<PaginatedResult<AffiliateProgram>>(`/api/affiliates/programs${qs(params)}`)
  },

  async getProgramById(id: string): Promise<AffiliateProgram> {
    return api.get<AffiliateProgram>(`/api/affiliates/programs/${id}`)
  },

  async createProgram(data: AffiliateProgramCreateInput): Promise<AffiliateProgram> {
    const { tenantId: _tenantId, ...request } = data
    return api.post<AffiliateProgram>("/api/affiliates/programs", request)
  },

  async updateProgram(id: string, data: AffiliateProgramUpdateInput): Promise<AffiliateProgram> {
    await api.put<{ id: string }>(`/api/affiliates/programs/${id}`, data)
    return this.getProgramById(id)
  },

  async deleteProgram(id: string): Promise<void> {
    throw new Error(`Affiliate program deletion is not implemented by the current API (id: ${id})`)
  },

  async listAffiliates(filters: { programId?: string; status?: string; tenantId?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Affiliate>> {
    return this.list(filters, pagination)
  },

  async getAffiliateById(id: string): Promise<Affiliate> {
    return this.getById(id)
  },

  async createAffiliate(data: AffiliateCreateInput): Promise<Affiliate> {
    return this.create(data)
  },

  async listCommissions(affiliateId: string, filters: { status?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Commission>> {
    const params = { status: filters.status, cursor: pagination?.cursor ?? filters.cursor, limit: pagination?.limit ?? filters.limit ?? 20 }
    return api.get<PaginatedResult<Commission>>(`/api/affiliates/${affiliateId}/commissions${qs(params)}`)
  },

  async listPayouts(affiliateId: string, filters: { status?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Payout>> {
    const params = { status: filters.status, cursor: pagination?.cursor ?? filters.cursor, limit: pagination?.limit ?? filters.limit ?? 20 }
    return api.get<PaginatedResult<Payout>>(`/api/affiliates/${affiliateId}/payouts${qs(params)}`)
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
    return ApiAffiliateRepository.listCommissions(affiliateId, filters, pagination)
  },
  async create(data: CommissionCreateInput): Promise<Commission> {
    const { affiliateId, ...request } = data
    return api.post<Commission>(`/api/affiliates/${affiliateId}/commissions`, request)
  },
}

export const ApiPayoutRepository = {
  async listByAffiliateId(affiliateId: string, filters: { status?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Payout>> {
    return ApiAffiliateRepository.listPayouts(affiliateId, filters, pagination)
  },
  async create(data: PayoutCreateInput): Promise<Payout> {
    const { affiliateId, ...request } = data
    return api.post<Payout>(`/api/affiliates/${affiliateId}/payouts`, request)
  },
}
