import { eq } from 'drizzle-orm'
import {
  getDb,
  contacts,
  companies,
  supportTickets,
  contracts,
} from '@crm/database'
import { CustomerPortalOverview } from '../domain/entities/portal-overview.entity'
import { KbArticlesDrizzleHelper } from './kb-articles.drizzle'

export class KbPortalDrizzleHelper {
  private static get db() { return getDb() }

  static async getPortalOverview(tenantId: string, contactId: string): Promise<CustomerPortalOverview> {
    const contactRows = await this.db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1)
    const contact = contactRows[0]
    const contactName = contact ? `${contact.firstName} ${contact.lastName ?? ''}`.trim() : 'Cliente'
    const contactEmail = contact ? contact.email : null

    let companyName: string | null = null
    if (contact?.companyId) {
      const comp = await this.db.select().from(companies).where(eq(companies.id, contact.companyId)).limit(1)
      if (comp.length > 0) companyName = comp[0].name
    }

    const [ticketsList, contractsList, featuredArticles] = await Promise.all([
      this.db.select().from(supportTickets).where(eq(supportTickets.contactId, contactId)),
      this.db.select().from(contracts).where(eq(contracts.tenantId, tenantId)),
      KbArticlesDrizzleHelper.listArticles(tenantId, { publicOnly: true }),
    ])

    const openTicketsCount = ticketsList.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length

    return new CustomerPortalOverview(
      contactId,
      contactName,
      contactEmail,
      companyName,
      openTicketsCount,
      1,
      contractsList.length,
      featuredArticles.slice(0, 4),
    )
  }
}
