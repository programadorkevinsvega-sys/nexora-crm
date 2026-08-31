import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"

export interface Contact {
  id: string
  tenantId: string
  companyId: string | null
  firstName: string
  lastName: string | null
  identificationType: string | null
  identificationNumber: string | null
  verificationDigit: string | null
  email: string | null
  phone: string | null
  birthDate: string | null
  streetAddress: string | null
  city: string | null
  stateProvince: string | null
  postalCode: string | null
  country: string | null
  latitude: string | null
  longitude: string | null
  nickname: string | null
  gender: string | null
  isStarred: boolean
  isDeceased: boolean
  stayInTouchFrequencyDays: number | null
  lastTalkedToAt: string | null
  taxRegime: string | null
  isTaxLiable: boolean
  jobTitle: string | null
  leadSource: string | null
  leadStatus: string
  loyaltyPoints: number
  avatarUrl: string | null
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ContactCreateInput {
  tenantId: string
  firstName: string
  lastName?: string | null
  companyId?: string | null
  identificationType?: string | null
  identificationNumber?: string | null
  verificationDigit?: string | null
  email?: string | null
  phone?: string | null
  birthDate?: string | null
  streetAddress?: string | null
  city?: string | null
  stateProvince?: string | null
  postalCode?: string | null
  country?: string | null
  latitude?: string | null
  longitude?: string | null
  nickname?: string | null
  gender?: string | null
  isStarred?: boolean
  isDeceased?: boolean
  stayInTouchFrequencyDays?: number | null
  lastTalkedToAt?: string | null
  taxRegime?: string | null
  isTaxLiable?: boolean
  jobTitle?: string | null
  leadSource?: string | null
  leadStatus?: string
  loyaltyPoints?: number
  avatarUrl?: string | null
  metadata?: Record<string, any>
}

export interface ContactUpdateInput {
  firstName?: string
  lastName?: string | null
  companyId?: string | null
  identificationType?: string | null
  identificationNumber?: string | null
  verificationDigit?: string | null
  email?: string | null
  phone?: string | null
  birthDate?: string | null
  streetAddress?: string | null
  city?: string | null
  stateProvince?: string | null
  postalCode?: string | null
  country?: string | null
  latitude?: string | null
  longitude?: string | null
  nickname?: string | null
  gender?: string | null
  isStarred?: boolean
  isDeceased?: boolean
  stayInTouchFrequencyDays?: number | null
  lastTalkedToAt?: string | null
  taxRegime?: string | null
  isTaxLiable?: boolean
  jobTitle?: string | null
  leadSource?: string | null
  leadStatus?: string
  loyaltyPoints?: number
  avatarUrl?: string | null
  metadata?: Record<string, any>
}

export interface ContactFilters {
  companyId?: string
  tenantId?: string
  search?: string
  leadStatus?: string
  isStarred?: boolean
  cursor?: string
  limit?: number
}

export const ApiContactRepository = {
  async list(filters: ContactFilters = {}, pagination?: { cursor?: string; limit?: number } | Pagination): Promise<PaginatedResult<Contact>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Contact>>(`/api/contacts${qs(params)}`)
  },
  async getById(id: string): Promise<Contact> {
    return api.get<Contact>(`/api/contacts/${id}`)
  },
  async create(data: ContactCreateInput): Promise<Contact> {
    return api.post<Contact>("/api/contacts", data)
  },
  async update(id: string, data: ContactUpdateInput): Promise<Contact> {
    return api.put<Contact>(`/api/contacts/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/contacts/${id}`)
  },
}
