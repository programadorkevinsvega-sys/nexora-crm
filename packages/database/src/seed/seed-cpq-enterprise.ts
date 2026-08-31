import { getDb } from '@crm/database'
import {
  products, quotes, quoteApprovals, productTemplates,
  contracts, salesTeams, salesTeamMembers, salesQuotas,
  competitors, lostReasons, campaigns, campaignMembers,
} from '@crm/database'

export async function seedCpqEnterpriseData(
  db: ReturnType<typeof getDb>,
  tenantId: string,
  companyIds: string[],
  contactIds: string[],
  userIds: string[],
  dealIds: string[],
) {
  const now = new Date()

  // 1. CPQ Products Catalog
  const productList = [
    { sku: 'NEX-ENT-CORE', name: 'Nexora CRM Enterprise Suite (Core)', desc: 'Plataforma completa modular con soporte para 50 usuarios concurrentes.', price: '1200.00', type: 'MONTHLY_SUBSCRIPTION' },
    { sku: 'NEX-AI-RADAR', name: 'Nexora AI Copilot & Radar Predictivo', desc: 'Módulo de Machine Learning para Deal Win Probability y generación de copys.', price: '450.00', type: 'MONTHLY_SUBSCRIPTION' },
    { sku: 'NEX-CPQ-ENGINE', name: 'Motor de Cotizaciones Avanzadas (CPQ)', desc: 'Generador de cotizaciones con reglas de descuento y firma electrónica.', price: '350.00', type: 'MONTHLY_SUBSCRIPTION' },
    { sku: 'NEX-OMNI-INBOX', name: 'Inbox Omnicanal (WhatsApp, Email, Chat)', desc: 'Conectores en tiempo real con SLA y enrutamiento inteligente.', price: '300.00', type: 'MONTHLY_SUBSCRIPTION' },
    { sku: 'NEX-DEDICATED-NODE', name: 'Nodo de Infraestructura Dedicado', desc: 'Despliegue en clúster PostgreSQL aislado con RLS y 99.99% SLA.', price: '2500.00', type: 'MONTHLY_SUBSCRIPTION' },
    { sku: 'NEX-ONBOARDING-PRO', name: 'Servicio de Implementación & Onboarding', desc: 'Consultoría técnica, migración de datos y capacitación para equipos.', price: '3500.00', type: 'ONE_TIME' },
  ]
  const productIds: string[] = []
  for (const p of productList) {
    const id = crypto.randomUUID()
    await db.insert(products).values({
      id,
      tenantId,
      sku: p.sku,
      name: p.name,
      description: p.desc,
      unitPrice: p.price,
      currency: 'USD',
      pricingType: p.type,
      taxRate: '19.00',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
    productIds.push(id)
  }

  // 2. CPQ Product Templates
  await db.insert(productTemplates).values({
    id: crypto.randomUUID(),
    tenantId,
    name: 'Plantilla Paquete Enterprise Cloud',
    category: 'ENTERPRISE',
    defaultUnitPrice: '2500.00',
    defaultCurrency: 'USD',
    pricingType: 'MONTHLY_SUBSCRIPTION',
    defaultTaxRate: '19.00',
    defaultDescription: 'Incluye Core + AI Copilot + Soporte 24/7.',
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing()

  // 3. Quotes & Approvals
  const quoteIds: string[] = []
  for (let i = 0; i < dealIds.length; i++) {
    const quoteId = crypto.randomUUID()
    const subtotal = String(25000 + i * 15000)
    const tax = String(Math.round(Number(subtotal) * 0.19))
    const total = String(Number(subtotal) + Number(tax))
    await db.insert(quotes).values({
      id: quoteId,
      tenantId,
      dealId: dealIds[i],
      quoteNumber: `QTE-2026-${1001 + i}`,
      status: ['DRAFT', 'SENT', 'ACCEPTED', 'ACCEPTED', 'SENT', 'DRAFT'][i % 6] as any,
      validUntil: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      subtotal,
      taxTotal: tax,
      grandTotal: total,
      termsAndConditions: 'Pago a 30 días neto. Soporte Enterprise incluido durante la vigencia.',
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
    quoteIds.push(quoteId)

    if (i < 2) {
      await db.insert(quoteApprovals).values({
        id: crypto.randomUUID(),
        tenantId,
        quoteId,
        requestedDiscountPercent: '15.00',
        requestedByUserId: userIds[1] || userIds[0],
        approverUserId: userIds[0],
        status: i === 0 ? 'APPROVED' : 'PENDING',
        decidedAt: i === 0 ? now : null,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing()
    }
  }

  // 4. Enterprise Contracts
  const contractData = [
    { name: 'Contrato Marco Enterprise — Stripe LATAM', mrr: '7500.00', months: 36, autoRenew: true },
    { name: 'Licencia Corporativa Anual — Nubank Brasil', mrr: '10000.00', months: 12, autoRenew: true },
    { name: 'Acuerdo Cloud SLA Dedicado — MercadoLibre', mrr: '12500.00', months: 24, autoRenew: false },
    { name: 'Suscripción Scale — Rappi Prime', mrr: '4000.00', months: 12, autoRenew: true },
  ]
  for (let i = 0; i < contractData.length; i++) {
    const c = contractData[i]
    await db.insert(contracts).values({
      id: crypto.randomUUID(),
      tenantId,
      companyId: companyIds[i % companyIds.length],
      name: c.name,
      startDate: now.toISOString().split('T')[0],
      endDate: new Date(Date.now() + c.months * 30 * 86400000).toISOString().split('T')[0],
      autoRenew: c.autoRenew,
      mrrValue: c.mrr,
      status: 'ACTIVE',
      ownerUserId: userIds[0],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  // 5. Sales Teams, Members & Quotas
  const teamNames = ['Equipo Comercial LATAM Norte', 'Equipo Enterprise Cono Sur', 'Equipo Customer Success']
  const teamIds: string[] = []
  for (let i = 0; i < teamNames.length; i++) {
    const id = crypto.randomUUID()
    await db.insert(salesTeams).values({
      id,
      tenantId,
      name: teamNames[i],
      managerUserId: userIds[i % userIds.length],
      monthlyTarget: ['120000', '180000', '80000'][i],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
    teamIds.push(id)

    for (let u = 0; u < userIds.length; u++) {
      await db.insert(salesTeamMembers).values({
        teamId: id,
        userId: userIds[u],
        tenantId,
      }).onConflictDoNothing()
    }

    await db.insert(salesQuotas).values({
      id: crypto.randomUUID(),
      tenantId,
      userId: userIds[i % userIds.length],
      teamId: id,
      periodMonth: new Date().getMonth() + 1,
      periodYear: new Date().getFullYear(),
      targetAmount: ['60000', '90000', '40000'][i],
      createdAt: now,
    }).onConflictDoNothing()
  }

  // 6. Competitors & Lost Reasons
  await db.insert(competitors).values({ id: crypto.randomUUID(), tenantId, name: 'Salesforce Enterprise', strengths: 'Marca global y ecosistema amplio', weaknesses: 'Altísimo costo de licencias y personalización compleja', createdAt: now }).onConflictDoNothing()
  await db.insert(competitors).values({ id: crypto.randomUUID(), tenantId, name: 'HubSpot Sales Hub', strengths: 'Facilidad de uso en marketing', weaknesses: 'Costos exponenciales al escalar contactos', createdAt: now }).onConflictDoNothing()
  for (const reason of ['Presupuesto congelado para Q3', 'Prefirió solución in-house', 'Decisión pospuesta para 2027', 'Falta de soporte local 24/7']) {
    await db.insert(lostReasons).values({ id: crypto.randomUUID(), tenantId, name: reason, createdAt: now }).onConflictDoNothing()
  }

  // 7. Campaigns
  const campaignList = [
    { name: 'Campaña Lanzamiento AI Copilot 2026', type: 'EMAIL', budget: '8000', revenue: '45000' },
    { name: 'Webinar: Arquitectura Hexagonal en CRM', type: 'EVENT', budget: '3500', revenue: '28000' },
    { name: 'Q3 Enterprise Upgrade Promotion', type: 'PROMOTION', budget: '12000', revenue: '95000' },
  ]
  for (const camp of campaignList) {
    const id = crypto.randomUUID()
    await db.insert(campaigns).values({
      id,
      tenantId,
      name: camp.name,
      type: camp.type,
      status: 'ACTIVE',
      budgetedCost: camp.budget,
      expectedRevenue: camp.revenue,
      startDate: now.toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()

    for (let c = 0; c < 2; c++) {
      await db.insert(campaignMembers).values({
        id: crypto.randomUUID(),
        tenantId,
        campaignId: id,
        contactId: contactIds[c],
        status: 'SENT',
        createdAt: now,
      }).onConflictDoNothing()
    }
  }

  return { productIds, quoteIds }
}
