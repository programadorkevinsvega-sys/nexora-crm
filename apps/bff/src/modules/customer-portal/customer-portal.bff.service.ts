import { Injectable, NotFoundException } from '@nestjs/common'
import { and, desc, eq } from 'drizzle-orm'
import { contacts, deals, getDb, quotes } from '@crm/database'
import type { SupportTicket } from '@crm/contracts'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { resolveCustomerPortalIdentity } from './customer-portal.identity'

export interface CustomerPortalTicket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
}

export interface CustomerPortalQuote {
  id: string
  quoteNumber: string
  status: string
  grandTotal: string | number | null
  currency: string
  validUntil: string
  createdAt: string
}

export interface CreateCustomerPortalTicket {
  subject: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

@Injectable()
export class CustomerPortalBffService {
  constructor(private readonly api: ApiCoreGrpcClient) {}

  private get db() {
    return getDb()
  }

  private async assertContactBelongsToTenant(tenantId: string, contactId: string): Promise<void> {
    const rows = await this.db
      .select({ id: contacts.id })
      .from(contacts)
      .where(and(
        eq(contacts.id, contactId),
        eq(contacts.tenantId, tenantId),
      ))
      .limit(1)

    if (rows.length === 0) {
      // Do not reveal whether a contact exists in another tenant.
      throw new NotFoundException('Customer portal identity is not available')
    }
  }

  private toPortalTicket(ticket: SupportTicket): CustomerPortalTicket {
    return {
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }
  }

  async getMyPortal(user?: AuthenticatedUser) {
    const identity = resolveCustomerPortalIdentity(user)
    await this.assertContactBelongsToTenant(identity.tenantId, identity.contactId)

    const [overview, ticketsPage, quoteRows, categories, publishedArticles] = await Promise.all([
      this.api.getCustomerPortalOverview(identity.tenantId, identity.contactId),
      this.api.listTickets({
        tenantId: identity.tenantId,
        contactId: identity.contactId,
        limit: 50,
      }),
      this.db
        .select({
          id: quotes.id,
          quoteNumber: quotes.quoteNumber,
          status: quotes.status,
          grandTotal: quotes.grandTotal,
          currency: deals.currency,
          validUntil: quotes.validUntil,
          createdAt: quotes.createdAt,
        })
        .from(quotes)
        .innerJoin(deals, and(
          eq(quotes.dealId, deals.id),
          eq(quotes.tenantId, deals.tenantId),
        ))
        .where(and(
          eq(quotes.tenantId, identity.tenantId),
          eq(deals.contactId, identity.contactId),
        ))
        .orderBy(desc(quotes.createdAt))
        .limit(50),
      this.api.listKbCategories(identity.tenantId),
      this.api.listKbArticles(identity.tenantId, { publicOnly: true }),
    ])

    const publicCategoryIds = new Set(
      categories.filter((category) => category.isPublic).map((category) => category.id),
    )
    const publicFeaturedArticles = publishedArticles
      .filter((article) => !article.categoryId || publicCategoryIds.has(article.categoryId))
      .slice(0, 4)

    return {
      overview: { ...overview, featuredArticles: publicFeaturedArticles },
      tickets: ticketsPage.data.map((ticket) => this.toPortalTicket(ticket)),
      quotes: quoteRows.map((quote) => ({
        ...quote,
        status: quote.status ?? 'DRAFT',
        grandTotal: quote.grandTotal ?? 0,
        currency: quote.currency ?? 'USD',
        validUntil: quote.validUntil,
        createdAt: quote.createdAt.toISOString(),
      })),
    }
  }

  async createTicket(user: AuthenticatedUser | undefined, input: CreateCustomerPortalTicket) {
    const identity = resolveCustomerPortalIdentity(user)
    await this.assertContactBelongsToTenant(identity.tenantId, identity.contactId)

    const ticket = await this.api.createTicket({
      tenantId: identity.tenantId,
      contactId: identity.contactId,
      subject: input.subject.trim(),
      description: input.description.trim(),
      priority: input.priority,
    })

    return this.toPortalTicket(ticket)
  }
}
