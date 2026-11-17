import type {
  PartnerTier,
  Partner,
  CreatePartnerDto,
  PartnerDealRegistration,
  CreateDealRegistrationDto,
} from '@crm/contracts'
import { api, qs } from '../../api/api-client'

export class ApiPrmRepository {
  static async listTiers(): Promise<PartnerTier[]> {
    return api.get<PartnerTier[]>('/api/prm/tiers')
  }

  static async listPartners(): Promise<Partner[]> {
    return api.get<Partner[]>('/api/prm/partners')
  }

  static async createPartner(dto: CreatePartnerDto): Promise<Partner> {
    return api.post<Partner>('/api/prm/partners', dto)
  }

  static async listDealRegistrations(partnerId?: string): Promise<PartnerDealRegistration[]> {
    return api.get<PartnerDealRegistration[]>(`/api/prm/deals${qs({ partnerId })}`)
  }

  static async submitDealRegistration(
    dto: CreateDealRegistrationDto,
  ): Promise<PartnerDealRegistration> {
    return api.post<PartnerDealRegistration>('/api/prm/deals', dto)
  }

  static async approveDealRegistration(
    registrationId: string,
  ): Promise<PartnerDealRegistration> {
    return api.patch<PartnerDealRegistration>(`/api/prm/deals/${registrationId}/approve`)
  }
}
