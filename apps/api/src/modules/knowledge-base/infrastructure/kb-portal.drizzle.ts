import { and, eq } from 'drizzle-orm'
import { NotFoundException } from '@nestjs/common'
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
    const contactRows = await this.db
      .select()
      .from(contacts)
      .where(and(
        eq(contacts.id, contactId),
        eq(contacts.tenantId, tenantId),
      ))
      .limit(1)
    const contact = contactRows[0]
    if (!contact) throw new NotFoundException('Contact not found')

    const contactName = `${contact.firstName} ${contact.lastName ?? ''}`.trim()
    const contactEmail = contact.email

    let companyName: string | null = null
    if (contact.companyId) {
      const comp = await this.db
        .select()
        .from(companies)
        .where(and(
          eq(companies.id, contact.companyId),
          eq(companies.tenantId, tenantId),
        ))
        .limit(1)
      if (comp.length > 0) companyName = comp[0].name
    }

    const [ticketsList, contractsList, featuredArticles] = await Promise.all([
      this.db.select().from(supportTickets).where(and(
        eq(supportTickets.tenantId, tenantId),
        eq(supportTickets.contactId, contactId),
      )),
      contact.companyId
        ? this.db.select().from(contracts).where(and(
            eq(contracts.tenantId, tenantId),
            eq(contracts.companyId, contact.companyId),
            eq(contracts.status, 'ACTIVE'),
          ))
        : Promise.resolve([]),
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
