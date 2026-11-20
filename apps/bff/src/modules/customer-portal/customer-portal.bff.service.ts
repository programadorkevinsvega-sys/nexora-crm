import { Injectable, NotFoundException } from '@nestjs/common'
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

  private async assertContactBelongsToTenant(tenantId: string, contactId: string): Promise<void> {
    const contact = await this.api.getContact(tenantId, contactId)
    if (contact.id !== contactId || contact.tenantId !== tenantId) {
      throw new NotFoundException('Customer portal identity is not available')
    }
  }

  private async listPortalQuotes(tenantId: string, contactId: string): Promise<CustomerPortalQuote[]> {
    const dealsPage = await this.api.listDeals({ tenantId, contactId, limit: 100 })
    const ownedDeals = dealsPage.data.filter((deal) => deal.contactId === contactId)
    const rows: CustomerPortalQuote[] = []

    for (let index = 0; index < ownedDeals.length; index += 10) {
      const batch = ownedDeals.slice(index, index + 10)
      const pages = await Promise.all(batch.map((deal) =>
        this.api.listQuotes({ tenantId, dealId: deal.id, limit: 100 }),
      ))
      pages.forEach((page, pageIndex) => {
        const deal = batch[pageIndex]
        page.data.forEach((quote) => rows.push({
          id: quote.id,
          quoteNumber: quote.quoteNumber,
          status: quote.status,
          grandTotal: quote.grandTotal ?? 0,
          currency: deal.currency || 'USD',
          validUntil: quote.validUntil,
          createdAt: quote.createdAt,
        }))
      })
    }

    return rows
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 50)
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
      this.listPortalQuotes(identity.tenantId, identity.contactId),
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
      quotes: quoteRows,
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
