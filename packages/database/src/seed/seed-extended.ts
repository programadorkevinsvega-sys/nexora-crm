import { getDb } from '@crm/database'
import {
  notes, tasks, calls, supportTickets,
  campaigns, campaignMembers, quotes,
  salesTeams, salesTeamMembers, salesQuotas, lostReasons, competitors,
  contracts,
  affiliatePrograms, affiliates, affiliateCommissions, affiliatePayouts,
  helpdeskMailboxes, helpdeskConversations,
  relationshipTypes, lifeEvents, contactGifts, contactDebts, contactReminders,
  loyaltyProfiles, customerSegments, segmentAssignments, customerMetrics,
  contactNotes, activities, contactPets, ticketReplies,
  ticketStatuses, ticketPriorities, ticketCategories, agentProfiles,
  tenants, branches, tenantBranding,
  systemModules, tenantLanguages, tenantCurrencies, tenantApiKeys,
} from '@crm/database'

export async function seedExtendedData(
  db: ReturnType<typeof getDb>,
  tenantId: string,
  companyIds: string[],
  contactIds: string[],
  userIds: string[],
  _pipelineId: string,
  _stageIds: string[],
  _tagIds: string[],
  dealIds: string[],
) {
  const now = new Date()

  // ─── Tenants ─────────────────────────────────────────────
  await db.insert(tenants).values({ id: tenantId, name: 'Ultra ERP Demo', legalName: 'Ultra ERP Solutions S.A.S.', taxId: 'NIT901234567', industryType: 'Technology', status: 'ACTIVE', timezone: 'America/Bogota', currencyCode: 'USD', ownerUserId: userIds[0], createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(branches).values({ id: crypto.randomUUID(), tenantId, name: 'Main Office', code: 'HQ', city: 'Bogota', country: 'Colombia', isHeadquarters: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(tenantBranding).values({ tenantId, primaryColor: '#3B82F6', secondaryColor: '#1E293B', updatedAt: now }).onConflictDoNothing()
  await db.insert(systemModules).values({ id: crypto.randomUUID(), name: 'Companies', slug: 'companies', category: 'CRM', isCore: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(tenantLanguages).values({ id: crypto.randomUUID(), tenantId, isoCode: 'en', name: 'English', isDefault: true, isActive: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(tenantCurrencies).values({ id: crypto.randomUUID(), tenantId, isoCode: 'USD', name: 'US Dollar', symbol: '$', isBaseCurrency: true, isActive: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(tenantApiKeys).values({ id: crypto.randomUUID(), tenantId, name: 'API Key', tokenHash: crypto.randomUUID(), lastFourChars: 'abcd', scopesJson: JSON.stringify(['read']), isActive: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  console.log('  - Tenant: config, branding, modules, languages, currencies')

  // ─── Interactions ────────────────────────────────────────
  const noteContent = ['Discussed contract renewal', 'Followed up on ticket', 'Quarterly review']
  for (let i = 0; i < 3; i++) {
    await db.insert(notes).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[i % contactIds.length], content: noteContent[i], authorUserId: userIds[0], createdAt: now, updatedAt: now })
  }
  const taskTitles = ['Prepare Q3 proposal', 'Call prospect', 'Send follow-up email']
  for (let i = 0; i < 3; i++) {
    await db.insert(tasks).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[i % contactIds.length], title: taskTitles[i], dueDate: new Date(Date.now() + 7 * 86400000), assignedUserId: userIds[i % userIds.length], createdAt: now, updatedAt: now })
  }
  await db.insert(calls).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], callType: 'OUTBOUND', durationSeconds: 540, summary: 'Discovery call', happenedAt: now, authorUserId: userIds[1], createdAt: now })
  await db.insert(calls).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[1], callType: 'INBOUND', durationSeconds: 720, summary: 'Product demo', happenedAt: new Date(Date.now() - 86400000), authorUserId: userIds[0], createdAt: now })
  console.log('  - 3 notes, 3 tasks, 2 calls')

  // ─── Support Tickets ──────────────────────────────────────
  const ticketIds: string[] = []
  const ticketSubjects = ['Login issue mobile app', 'Invoice discrepancy Q2', 'Feature request dark mode', 'Server timeout error']
  for (let i = 0; i < 4; i++) {
    const id = crypto.randomUUID()
    await db.insert(supportTickets).values({ id, tenantId, contactId: contactIds[i % contactIds.length], subject: ticketSubjects[i], description: ticketSubjects[i], status: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'][i], priority: i === 3 ? 'HIGH' : 'MEDIUM', assignedUserId: i < 2 ? userIds[1] : undefined, createdAt: new Date(Date.now() - i * 86400000), updatedAt: now })
    ticketIds.push(id)
  }
  await db.insert(ticketReplies).values({ id: crypto.randomUUID(), tenantId, ticketId: ticketIds[0], authorType: 'CUSTOMER', authorId: contactIds[0], message: 'Cannot login since yesterday', createdAt: now })
  await db.insert(ticketReplies).values({ id: crypto.randomUUID(), tenantId, ticketId: ticketIds[0], authorType: 'AGENT', authorId: userIds[1], message: 'Password reset sent', createdAt: new Date(Date.now() + 3600000) })
  console.log('  - 4 tickets, 2 replies')

  // ─── Campaigns ────────────────────────────────────────────
  const campaignIds: string[] = []
  for (const c of [{ name: 'Q3 Newsletter', type: 'EMAIL', status: 'ACTIVE', budget: '5000', revenue: '15000' }, { name: 'Holiday Promotion', type: 'PROMOTION', status: 'PLANNED', budget: '10000', revenue: '30000' }, { name: 'Webinar 2026', type: 'EVENT', status: 'ACTIVE', budget: '3000', revenue: '8000' }]) {
    const id = crypto.randomUUID()
    await db.insert(campaigns).values({ id, tenantId, name: c.name, type: c.type, status: c.status, budgetedCost: c.budget, expectedRevenue: c.revenue, startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0], createdAt: now, updatedAt: now })
    campaignIds.push(id)
  }
  await db.insert(campaignMembers).values({ id: crypto.randomUUID(), tenantId, campaignId: campaignIds[0], contactId: contactIds[0], status: 'SENT', createdAt: now })
  await db.insert(campaignMembers).values({ id: crypto.randomUUID(), tenantId, campaignId: campaignIds[0], contactId: contactIds[1], status: 'SENT', createdAt: now })
  console.log('  - 3 campaigns, 2 members')

  // ─── Quotes ───────────────────────────────────────────────
  for (let i = 0; i < 3; i++) {
    const subtotal = String(5000 + i * 3000)
    const tax = String(Math.round(Number(subtotal) * 0.19))
    await db.insert(quotes).values({ id: crypto.randomUUID(), tenantId, dealId: dealIds[i % dealIds.length], quoteNumber: `QTE-${2026001 + i}`, status: ['DRAFT', 'SENT', 'ACCEPTED'][i], validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], subtotal, taxTotal: tax, grandTotal: String(Number(subtotal) + Number(tax)), termsAndConditions: 'Standard terms apply', createdAt: now, updatedAt: now })
  }
  console.log('  - 3 quotes')

  // ─── Contracts ────────────────────────────────────────────
  await db.insert(contracts).values({ id: crypto.randomUUID(), tenantId, companyId: companyIds[0], name: 'Annual Support Contract', startDate: now.toISOString().split('T')[0], endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0], autoRenew: true, mrrValue: '2500', status: 'ACTIVE', ownerUserId: userIds[0], createdAt: now, updatedAt: now })
  await db.insert(contracts).values({ id: crypto.randomUUID(), tenantId, companyId: companyIds[1], name: 'SaaS License Agreement', startDate: now.toISOString().split('T')[0], endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0], autoRenew: false, mrrValue: '5000', status: 'ACTIVE', ownerUserId: userIds[1], createdAt: now, updatedAt: now })
  console.log('  - 2 contracts')

  // ─── Sales Teams ──────────────────────────────────────────
  const teamIds: string[] = []
  for (let i = 0; i < 3; i++) {
    const id = crypto.randomUUID()
    await db.insert(salesTeams).values({ id, tenantId, name: ['Enterprise Sales', 'SMB Sales', 'Customer Success'][i], managerUserId: userIds[i], monthlyTarget: ['100000', '50000', '30000'][i], createdAt: now, updatedAt: now })
    teamIds.push(id)
  }
  await db.insert(salesTeamMembers).values({ teamId: teamIds[0], userId: userIds[0], tenantId })
  await db.insert(salesTeamMembers).values({ teamId: teamIds[0], userId: userIds[1], tenantId })
  await db.insert(salesTeamMembers).values({ teamId: teamIds[1], userId: userIds[2], tenantId })
  await db.insert(salesTeamMembers).values({ teamId: teamIds[2], userId: userIds[3], tenantId })
  await db.insert(salesQuotas).values({ id: crypto.randomUUID(), tenantId, userId: userIds[1], teamId: teamIds[0], periodMonth: 7, periodYear: 2026, targetAmount: '30000', createdAt: now })
  await db.insert(salesQuotas).values({ id: crypto.randomUUID(), tenantId, userId: userIds[2], teamId: teamIds[1], periodMonth: 7, periodYear: 2026, targetAmount: '15000', createdAt: now })
  const lostNames = ['Price too high', 'Competitor won', 'Budget not approved', 'No decision']
  for (const n of lostNames) {
    await db.insert(lostReasons).values({ id: crypto.randomUUID(), tenantId, name: n, createdAt: now })
  }
  await db.insert(competitors).values({ id: crypto.randomUUID(), tenantId, name: 'Salesforce', strengths: 'Market leader', weaknesses: 'Expensive', createdAt: now })
  await db.insert(competitors).values({ id: crypto.randomUUID(), tenantId, name: 'HubSpot', strengths: 'Easy to use', weaknesses: 'Limited customization', createdAt: now })
  console.log('  - 3 sales teams, 4 members, 2 quotas, 4 lost reasons, 2 competitors')

  // ─── Helpdesk ─────────────────────────────────────────────
  const mailboxId = crypto.randomUUID()
  await db.insert(helpdeskMailboxes).values({ id: mailboxId, tenantId, name: 'General Support', emailAddress: 'support@ultraerp.com', isActive: true, createdAt: now, updatedAt: now })
  await db.insert(helpdeskConversations).values({ id: crypto.randomUUID(), tenantId, mailboxId, subject: 'Need help with invoice', customerEmail: 'contact1@example.com', assigneeUserId: userIds[1], status: 'OPEN', priority: 'NORMAL', createdAt: new Date(Date.now() - 2 * 86400000), updatedAt: now })
  await db.insert(helpdeskConversations).values({ id: crypto.randomUUID(), tenantId, mailboxId, subject: 'API integration docs', customerEmail: 'dev@partner.com', assigneeUserId: userIds[1], status: 'PENDING', priority: 'LOW', createdAt: new Date(Date.now() - 7 * 86400000), updatedAt: now })
  console.log('  - 1 mailbox, 2 conversations')

  // ─── Affiliates ───────────────────────────────────────────
  const programId = crypto.randomUUID()
  await db.insert(affiliatePrograms).values({ id: programId, tenantId, name: 'Referral Partner Program', commissionType: 'PERCENTAGE', commissionValue: '15', cookieDurationDays: 30, isMultiLevel: false, isActive: true, createdAt: now, updatedAt: now })
  const affiliateId = crypto.randomUUID()
  await db.insert(affiliates).values({ id: affiliateId, tenantId, programId, customerId: contactIds[0], referralCode: 'DEMO50', referralLink: 'https://ultraerp.com/ref/DEMO50', status: 'ACTIVE', totalEarnings: '1250.00', createdAt: now, updatedAt: now })
  await db.insert(affiliateCommissions).values({ id: crypto.randomUUID(), tenantId, affiliateId, sourceOrderId: crypto.randomUUID(), commissionAmount: '250.00', mlmLevelEarned: 0, status: 'APPROVED', approvedAt: now, createdAt: now })
  await db.insert(affiliatePayouts).values({ id: crypto.randomUUID(), tenantId, affiliateId, amount: '500.00', paymentMethod: 'BANK_TRANSFER', status: 'COMPLETED', paidAt: now, createdAt: now })
  console.log('  - 1 program, 1 affiliate, 1 commission, 1 payout')

  // ─── Personal CRM ─────────────────────────────────────────
  for (const r of [{ n: 'Spouse', r: 'Spouse' }, { n: 'Sibling', r: 'Sibling' }, { n: 'Business Partner', r: 'Business Partner' }]) {
    await db.insert(relationshipTypes).values({ id: crypto.randomUUID(), tenantId, name: r.n, reverseName: r.r, createdAt: now })
  }
  await db.insert(lifeEvents).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], eventType: 'BIRTHDAY', name: 'John Birthday', description: 'Turns 35', happenedAt: new Date(Date.now() - 35 * 365 * 86400000).toISOString().split('T')[0], isYearlyRecurring: true, createdAt: now, updatedAt: now })
  await db.insert(lifeEvents).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[1], eventType: 'ANNIVERSARY', name: 'Work Anniversary', description: '5 years', happenedAt: new Date(Date.now() - 5 * 365 * 86400000).toISOString().split('T')[0], isYearlyRecurring: true, createdAt: now, updatedAt: now })
  await db.insert(contactGifts).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], direction: 'GIVEN', name: 'Christmas Gift Basket', estimatedValue: '150', status: 'GIVEN', dateGivenOrReceived: now.toISOString().split('T')[0], createdAt: now, updatedAt: now })
  await db.insert(contactDebts).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[1], direction: 'OWED', amount: '350.00', reason: 'Consulting fee', status: 'UNPAID', dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], createdAt: now, updatedAt: now })
  await db.insert(contactReminders).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], title: 'Follow up on deal', frequencyType: 'WEEKLY', frequencyInterval: 2, nextDueDate: new Date(Date.now() + 7 * 86400000), isActive: true, createdAt: now, updatedAt: now })
  await db.insert(contactPets).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], petCategory: 'DOG', name: 'Max', breed: 'Golden Retriever', createdAt: now, updatedAt: now })
  await db.insert(contactNotes).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], body: 'Prefers email. Interested in premium plan.', isFavorite: true, createdByUserId: userIds[0], createdAt: now, updatedAt: now })
  await db.insert(activities).values({ id: crypto.randomUUID(), tenantId, activityType: 'MEETING', summary: 'Annual review with client', happenedAt: now.toISOString().split('T')[0], createdAt: now, updatedAt: now })
  console.log('  - Personal CRM: relationships, life events, gifts, debts, reminders, pets, notes')

  // ─── Loyalty ──────────────────────────────────────────────
  for (let i = 0; i < 3; i++) {
    await db.insert(loyaltyProfiles).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[i], loyaltyPointsBalance: 100 + i * 500, tierLevel: ['BRONZE', 'SILVER', 'GOLD'][i], totalLifetimeValue: String(1000 + i * 5000), totalPurchasesCount: 5 + i * 10, averageOrderValue: String(200 + i * 50), lastPurchaseDate: now.toISOString().split('T')[0], createdAt: now, updatedAt: now })
  }
  const hvcSegmentId = crypto.randomUUID()
  await db.insert(customerSegments).values({ id: hvcSegmentId, tenantId, name: 'High Value Customers', description: 'LTV > $10,000', isDynamic: true, createdAt: now, updatedAt: now })
  await db.insert(customerSegments).values({ id: crypto.randomUUID(), tenantId, name: 'At Risk', description: 'No purchase 90 days', isDynamic: true, createdAt: now, updatedAt: now })
  await db.insert(segmentAssignments).values({ id: crypto.randomUUID(), tenantId, segmentId: hvcSegmentId, contactId: contactIds[0], assignedAt: now })
  await db.insert(customerMetrics).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], churnRiskScore: '0.05', rfmScore: '555', npsScore: 9, customerSatisfactionScore: '4.8', calculatedAt: now })
  await db.insert(customerMetrics).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[1], churnRiskScore: '0.30', rfmScore: '432', npsScore: 7, customerSatisfactionScore: '3.5', calculatedAt: now })
  console.log('  - 3 loyalty profiles, 2 segments, 2 metrics')

  // ─── Helpdesk ITSM ────────────────────────────────────────
  for (const s of [{ n: 'Open', c: '#3498db', s: 1 }, { n: 'In Progress', c: '#f39c12', s: 2 }, { n: 'Resolved', c: '#2ecc71', s: 3 }, { n: 'Closed', c: '#95a5a6', s: 4 }]) {
    await db.insert(ticketStatuses).values({ id: crypto.randomUUID(), tenantId, name: s.n, colorHex: s.c, isClosedState: s.n === 'Closed', sortOrder: s.s, createdAt: now, updatedAt: now })
  }
  await db.insert(ticketPriorities).values({ id: crypto.randomUUID(), tenantId, name: 'Low', level: 1, colorHex: '#2ecc71', createdAt: now, updatedAt: now })
  await db.insert(ticketPriorities).values({ id: crypto.randomUUID(), tenantId, name: 'Normal', level: 2, colorHex: '#3498db', slaFirstResponseHours: 24, slaResolutionHours: 72, createdAt: now, updatedAt: now })
  await db.insert(ticketPriorities).values({ id: crypto.randomUUID(), tenantId, name: 'High', level: 3, colorHex: '#e74c3c', slaFirstResponseHours: 4, slaResolutionHours: 24, createdAt: now, updatedAt: now })
  await db.insert(ticketCategories).values({ id: crypto.randomUUID(), tenantId, name: 'Bug Report', description: 'Software bugs', createdAt: now, updatedAt: now })
  await db.insert(agentProfiles).values({ id: crypto.randomUUID(), tenantId, userId: userIds[1], isAvailable: true, agentStatus: 'AVAILABLE', activeTicketsCount: 2, resolvedTicketsCount: 15, createdAt: now, updatedAt: now })
  console.log('  - Helpdesk ITSM: statuses, priorities, categories, agent profile')
}
