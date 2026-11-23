type DateInput = Date | string

interface DealFeedSource {
  id: string
  title: string
  value: string | number | null
  stageId: string
  status: string
  probability: string | number | null
  expectedCloseDate: DateInput | null
  createdAt: DateInput
  updatedAt: DateInput
}

interface ContactFeedSource {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  companyId: string | null
  lifecycleStage: string | null
  createdAt: DateInput
}

interface TicketFeedSource {
  id: string
  subject: string
  priority: string
  status: string
  category: string | null
  contactId: string | null
  createdAt: DateInput
}

export type BiFeedRow = Record<string, string | number | null>

export class BiDataFeedHelper {
  static formatDealsFeed(deals: DealFeedSource[]): BiFeedRow[] {
    return deals.map((deal) => ({
      DealId: deal.id,
      DealTitle: deal.title,
      ValueUSD: Number(deal.value) || 0,
      Stage: deal.stageId,
      Status: deal.status,
      Probability: Number(deal.probability) || 0,
      ExpectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString() : null,
      CreatedAt: new Date(deal.createdAt).toISOString(),
      UpdatedAt: new Date(deal.updatedAt).toISOString(),
    }))
  }

  static formatContactsFeed(contacts: ContactFeedSource[]): BiFeedRow[] {
    return contacts.map((contact) => ({
      ContactId: contact.id,
      FullName: `${contact.firstName} ${contact.lastName || ''}`.trim(),
      Email: contact.email,
      Phone: contact.phone,
      CompanyId: contact.companyId,
      LifecycleStage: contact.lifecycleStage,
      CreatedAt: new Date(contact.createdAt).toISOString(),
    }))
  }

  static formatTicketsFeed(tickets: TicketFeedSource[]): BiFeedRow[] {
    return tickets.map((ticket) => ({
      TicketId: ticket.id,
      Subject: ticket.subject,
      Priority: ticket.priority,
      Status: ticket.status,
      Category: ticket.category,
      ContactId: ticket.contactId,
      CreatedAt: new Date(ticket.createdAt).toISOString(),
    }))
  }
}
