import type { contacts, deals, supportTickets } from '@crm/database'

type DealFeedSource = Pick<
  typeof deals.$inferSelect,
  'id' | 'name' | 'amount' | 'stageId' | 'status' | 'probabilityOverride' |
  'expectedCloseDate' | 'createdAt' | 'updatedAt'
>
type ContactFeedSource = Pick<
  typeof contacts.$inferSelect,
  'id' | 'firstName' | 'lastName' | 'email' | 'phone' | 'companyId' | 'leadStatus' | 'createdAt'
>
type TicketFeedSource = Pick<
  typeof supportTickets.$inferSelect,
  'id' | 'subject' | 'priority' | 'status' | 'channel' | 'contactId' | 'createdAt'
>

export type BiFeedRow = Record<string, string | number | null>

export class BiDataFeedHelper {
  static formatDealsFeed(rows: DealFeedSource[]): BiFeedRow[] {
    return rows.map((deal) => ({
      DealId: deal.id,
      DealTitle: deal.name,
      ValueUSD: Number(deal.amount ?? 0),
      Stage: deal.stageId,
      Status: deal.status,
      Probability: Number(deal.probabilityOverride ?? 0),
      ExpectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString() : null,
      CreatedAt: deal.createdAt.toISOString(),
      UpdatedAt: deal.updatedAt.toISOString(),
    }))
  }

  static formatContactsFeed(rows: ContactFeedSource[]): BiFeedRow[] {
    return rows.map((contact) => ({
      ContactId: contact.id,
      FullName: `${contact.firstName} ${contact.lastName ?? ''}`.trim(),
      Email: contact.email,
      Phone: contact.phone,
      CompanyId: contact.companyId,
      LifecycleStage: contact.leadStatus,
      CreatedAt: contact.createdAt.toISOString(),
    }))
  }

  static formatTicketsFeed(rows: TicketFeedSource[]): BiFeedRow[] {
    return rows.map((ticket) => ({
      TicketId: ticket.id,
      Subject: ticket.subject,
      Priority: ticket.priority,
      Status: ticket.status,
      Category: ticket.channel,
      ContactId: ticket.contactId,
      CreatedAt: ticket.createdAt.toISOString(),
    }))
  }
}