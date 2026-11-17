export class BiDataFeedHelper {
  static formatDealsFeed(deals: any[]) {
    return deals.map((d) => ({
      DealId: d.id,
      DealTitle: d.title,
      ValueUSD: Number(d.value) || 0,
      Stage: d.stageId,
      Status: d.status,
      Probability: Number(d.probability) || 0,
      ExpectedCloseDate: d.expectedCloseDate ? new Date(d.expectedCloseDate).toISOString() : null,
      CreatedAt: new Date(d.createdAt).toISOString(),
      UpdatedAt: new Date(d.updatedAt).toISOString(),
    }))
  }

  static formatContactsFeed(contacts: any[]) {
    return contacts.map((c) => ({
      ContactId: c.id,
      FullName: `${c.firstName} ${c.lastName || ''}`.trim(),
      Email: c.email,
      Phone: c.phone,
      CompanyId: c.companyId,
      LifecycleStage: c.lifecycleStage,
      CreatedAt: new Date(c.createdAt).toISOString(),
    }))
  }

  static formatTicketsFeed(tickets: any[]) {
    return tickets.map((t) => ({
      TicketId: t.id,
      Subject: t.subject,
      Priority: t.priority,
      Status: t.status,
      Category: t.category,
      ContactId: t.contactId,
      CreatedAt: new Date(t.createdAt).toISOString(),
    }))
  }
}
