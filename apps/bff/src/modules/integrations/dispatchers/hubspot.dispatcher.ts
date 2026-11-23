import { Injectable, BadRequestException, Logger } from '@nestjs/common'

const HUBSPOT_BASE = 'https://api.hubapi.com'

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : {}
}
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

@Injectable()
export class HubSpotDispatcher {
  private readonly logger = new Logger(HubSpotDispatcher.name)

  private headers(accessToken: string): Record<string, string> {
    if (!accessToken) throw new BadRequestException('HubSpot Access Token es requerido')
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  }

  async test(
    creds: Record<string, unknown>,
    _recipient: string,
    _text: string,
  ): Promise<{ success: boolean; message: string; details?: unknown }> {
    const accessToken = creds.accessToken
    const syncContacts = creds.syncContacts
    const syncCompanies = creds.syncCompanies
    const syncDeals = creds.syncDeals

    if (typeof accessToken !== 'string' || accessToken.length === 0) throw new BadRequestException('HubSpot Access Token es requerido')

    try {
      const accountRes = await fetch(`${HUBSPOT_BASE}/account-info/v3/details`, {
        headers: this.headers(accessToken),
      })

      if (!accountRes.ok) {
        const err: unknown = await accountRes.json().catch(() => ({}))
        return {
          success: false,
          message: `HubSpot rechazó el token (${accountRes.status}): ${typeof asRecord(err).message === 'string' ? asRecord(err).message : accountRes.statusText}`,
        }
      }

      const account: unknown = await accountRes.json()
      const accountDetails = asRecord(account)
      const portalId = typeof accountDetails.portalId === 'string' ? accountDetails.portalId : 'unknown'

      const [contactsRes, companiesRes, dealsRes] = await Promise.allSettled([
        fetch(`${HUBSPOT_BASE}/crm/v3/objects/contacts?limit=1`, { headers: this.headers(accessToken) }),
        fetch(`${HUBSPOT_BASE}/crm/v3/objects/companies?limit=1`, { headers: this.headers(accessToken) }),
        fetch(`${HUBSPOT_BASE}/crm/v3/objects/deals?limit=1`, { headers: this.headers(accessToken) }),
      ])

      const getTotal = async (r: PromiseSettledResult<Response>): Promise<number | string> => {
        if (r.status !== 'fulfilled' || !r.value.ok) return 'N/A'
        const body: unknown = await r.value.json()
        const total = asRecord(body).total
        return typeof total === 'number' ? total : 'N/A'
      }

      const [contactTotal, companyTotal, dealTotal] = await Promise.all([
        getTotal(contactsRes),
        getTotal(companiesRes),
        getTotal(dealsRes),
      ])

      this.logger.log(`HubSpot verified: portalId=${portalId}`)
      return {
        success: true,
        message: `HubSpot CRM conectado. Portal: ${portalId}. Contactos: ${contactTotal}, Empresas: ${companyTotal}, Deals: ${dealTotal}. Sync: Contactos=${syncContacts ?? true}, Empresas=${syncCompanies ?? true}, Deals=${dealTotal}. Sync: Contactos=${syncContacts ?? true}, Empresas=${syncCompanies ?? true}, Deals=${syncDeals ?? true}`,
        details: { portalId, contactTotal, companyTotal, dealTotal },
      }
    } catch (err: unknown) {
      return { success: false, message: `Error conectando con HubSpot: ${errorMessage(err)}` }
    }
  }

  async syncContacts(
    accessToken: string,
    contacts: Array<{ email: string; firstName: string; lastName: string; phone?: string }>,
  ): Promise<number> {
    const results = await Promise.allSettled(
      contacts.map((c) =>
        fetch(`${HUBSPOT_BASE}/crm/v3/objects/contacts`, {
          method: 'POST',
          headers: this.headers(accessToken),
          body: JSON.stringify({
            properties: { email: c.email, firstname: c.firstName, lastname: c.lastName, phone: c.phone || '' },
          }),
        }),
      ),
    )
    return results.filter((r) => r.status === 'fulfilled').length
  }
}
