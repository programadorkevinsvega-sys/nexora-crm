import { Injectable, BadRequestException, Logger } from '@nestjs/common'

const HUBSPOT_BASE = 'https://api.hubapi.com'

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
    creds: Record<string, any>,
    _recipient: string,
    _text: string,
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const { accessToken, syncContacts, syncCompanies, syncDeals } = creds

    if (!accessToken) throw new BadRequestException('HubSpot Access Token es requerido')

    try {
      const accountRes = await fetch(`${HUBSPOT_BASE}/account-info/v3/details`, {
        headers: this.headers(accessToken),
      })

      if (!accountRes.ok) {
        const err = await accountRes.json().catch(() => ({}))
        return {
          success: false,
          message: `HubSpot rechazó el token (${accountRes.status}): ${(err as any).message || accountRes.statusText}`,
        }
      }

      const account = await accountRes.json()

      const [contactsRes, companiesRes, dealsRes] = await Promise.allSettled([
        fetch(`${HUBSPOT_BASE}/crm/v3/objects/contacts?limit=1`, { headers: this.headers(accessToken) }),
        fetch(`${HUBSPOT_BASE}/crm/v3/objects/companies?limit=1`, { headers: this.headers(accessToken) }),
        fetch(`${HUBSPOT_BASE}/crm/v3/objects/deals?limit=1`, { headers: this.headers(accessToken) }),
      ])

      const getTotal = async (r: PromiseSettledResult<Response>) =>
        r.status === 'fulfilled' && r.value.ok ? (await r.value.json()).total : 'N/A'

      const [contactTotal, companyTotal, dealTotal] = await Promise.all([
        getTotal(contactsRes),
        getTotal(companiesRes),
        getTotal(dealsRes),
      ])

      this.logger.log(`HubSpot verified: portalId=${(account as any).portalId}`)
      return {
        success: true,
        message: `HubSpot CRM conectado. Portal: ${(account as any).portalId}. Contactos: ${contactTotal}, Empresas: ${companyTotal}, Deals: ${dealTotal}. Sync: Contactos=${syncContacts ?? true}, Empresas=${syncCompanies ?? true}, Deals=${syncDeals ?? true}`,
        details: { portalId: (account as any).portalId, contactTotal, companyTotal, dealTotal },
      }
    } catch (err: any) {
      return { success: false, message: `Error conectando con HubSpot: ${err.message}` }
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
