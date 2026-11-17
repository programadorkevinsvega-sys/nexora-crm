import type {
  PartnerTier,
  Partner,
  CreatePartnerDto,
  PartnerDealRegistration,
  CreateDealRegistrationDto,
} from '@crm/contracts'

export class ApiPrmRepository {
  static async listTiers(): Promise<PartnerTier[]> {
    const res = await fetch('/api/prm/tiers', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar niveles de partners')
    return res.json()
  }

  static async listPartners(): Promise<Partner[]> {
    const res = await fetch('/api/prm/partners', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar partners')
    return res.json()
  }

  static async createPartner(dto: CreatePartnerDto): Promise<Partner> {
    const res = await fetch('/api/prm/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al registrar partner')
    return res.json()
  }

  static async listDealRegistrations(partnerId?: string): Promise<PartnerDealRegistration[]> {
    const url = partnerId ? `/api/prm/deals?partnerId=${partnerId}` : '/api/prm/deals'
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar registros de deals de partners')
    return res.json()
  }

  static async submitDealRegistration(
    dto: CreateDealRegistrationDto,
  ): Promise<PartnerDealRegistration> {
    const res = await fetch('/api/prm/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al enviar registro de deal de partner')
    return res.json()
  }

  static async approveDealRegistration(
    registrationId: string,
  ): Promise<PartnerDealRegistration> {
    const res = await fetch(`/api/prm/deals/${registrationId}/approve`, {
      method: 'PATCH',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al aprobar deal de partner')
    return res.json()
  }
}
