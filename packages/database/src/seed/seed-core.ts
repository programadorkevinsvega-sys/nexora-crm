import { getDb } from '@crm/database'
import {
  tenants, branches, tenantBranding, tenantLanguages, tenantCurrencies,
  companies, contacts, tags, contactTags,
  pipelines, pipelineStages, deals,
} from '@crm/database'

export async function seedCoreData(db: ReturnType<typeof getDb>, tenantId: string, ownerUserId: string) {
  const now = new Date()

  // 1. Tenant & Organization
  await db.insert(tenants).values({
    id: tenantId,
    name: 'Nexora Enterprise Demo Corp',
    legalName: 'Nexora Enterprise Global Solutions S.A.S.',
    taxId: 'NIT901.888.777-1',
    industryType: 'Enterprise Software & Cloud',
    status: 'ACTIVE',
    timezone: 'America/Bogota',
    currencyCode: 'USD',
    ownerUserId,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing()

  await db.insert(branches).values({
    id: crypto.randomUUID(),
    tenantId,
    name: 'Sede Principal (HQ)',
    code: 'HQ-BOG',
    city: 'Bogotá',
    country: 'Colombia',
    isHeadquarters: true,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing()

  await db.insert(tenantBranding).values({
    tenantId,
    primaryColor: '#06B6D4',
    secondaryColor: '#0F172A',
    updatedAt: now,
  }).onConflictDoNothing()

  // 2. B2B Enterprise Companies with full fields
  const companyData = [
    { name: 'Stripe Latin America', taxId: '900.100.201-1', ind: 'Fintech & Payments', emp: 1200, rev: '12000000', ph: '+57 601 3110001', em: 'contact@stripe.com', city: 'Bogotá', country: 'Colombia', tier: 'TIER_1_VIP', stage: 'CUSTOMER', score: 98, web: 'https://stripe.com' },
    { name: 'MercadoLibre Corp', taxId: '900.100.202-2', ind: 'E-commerce & Logistics', emp: 15000, rev: '85000000', ph: '+54 11 40001111', em: 'corporate@mercadolibre.com', city: 'Buenos Aires', country: 'Argentina', tier: 'TIER_1_VIP', stage: 'PROSPECT', score: 85, web: 'https://mercadolibre.com' },
    { name: 'Nubank Financial', taxId: '900.100.203-3', ind: 'Digital Banking', emp: 7500, rev: '45000000', ph: '+55 11 50002222', em: 'enterprise@nubank.com', city: 'São Paulo', country: 'Brasil', tier: 'TIER_1_VIP', stage: 'CUSTOMER', score: 95, web: 'https://nubank.com' },
    { name: 'Rappi Prime Enterprises', taxId: '900.100.204-4', ind: 'On-Demand Delivery', emp: 4500, rev: '28000000', ph: '+57 601 7000333', em: 'partners@rappi.com', city: 'Bogotá', country: 'Colombia', tier: 'TIER_2', stage: 'LEAD', score: 78, web: 'https://rappi.com' },
    { name: 'CloudScale SaaS Platform', taxId: '900.100.205-5', ind: 'Cloud Infrastructure', emp: 650, rev: '8500000', ph: '+1 415 5550199', em: 'sales@cloudscale.io', city: 'San Francisco', country: 'Estados Unidos', tier: 'TIER_2', stage: 'PARTNER', score: 90, web: 'https://cloudscale.io' },
    { name: 'BioHealth Pharma Systems', taxId: '900.100.206-6', ind: 'Healthcare & Pharma', emp: 3200, rev: '19000000', ph: '+52 55 88883322', em: 'info@biohealth.org', city: 'Ciudad de México', country: 'México', tier: 'TIER_3', stage: 'PROSPECT', score: 72, web: 'https://biohealth.org' },
  ]
  const companyIds: string[] = []
  for (const c of companyData) {
    const id = crypto.randomUUID()
    await db.insert(companies).values({
      id,
      tenantId,
      name: c.name,
      taxId: c.taxId,
      industry: c.ind,
      numberOfEmployees: c.emp,
      annualRevenue: c.rev,
      phone: c.ph,
      email: c.em,
      city: c.city,
      country: c.country,
      tier: c.tier,
      lifecycleStage: c.stage,
      healthScore: c.score,
      website: c.web,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
    companyIds.push(id)
  }

  // 3. Tags
  const tagList = [
    { name: 'VIP Enterprise', color: '#8B5CF6' },
    { name: 'Hot Prospect', color: '#EF4444' },
    { name: 'Closed Won Q3', color: '#10B981' },
    { name: 'Partner Tier 1', color: '#3B82F6' },
  ]
  const tagIds: string[] = []
  for (const t of tagList) {
    const id = crypto.randomUUID()
    await db.insert(tags).values({ id, tenantId, name: t.name, color: t.color, createdAt: now }).onConflictDoNothing()
    tagIds.push(id)
  }

  // 4. Contacts with full enterprise & WhatsApp fields
  const contactsData = [
    { fn: 'Carlos', ln: 'Mendoza', em: 'carlos.mendoza@stripe.com', ph: '+573001112233', wa: '+573001112233', title: 'CEO LATAM', lead: 'CUSTOMER', score: 95, city: 'Bogotá', country: 'Colombia', li: 'https://linkedin.com/in/carlos-mendoza-stripe' },
    { fn: 'Mateo', ln: 'Gómez', em: 'mateo.gomez@stripe.com', ph: '+573204445566', wa: '+573204445566', title: 'VP de Tecnología', lead: 'CUSTOMER', score: 92, city: 'Bogotá', country: 'Colombia', li: 'https://linkedin.com/in/mateo-gomez-tech' },
    { fn: 'Mariana', ln: 'Torres', em: 'mariana.torres@stripe.com', ph: '+573118889900', wa: '+573118889900', title: 'VP de Revenue', lead: 'CUSTOMER', score: 88, city: 'Bogotá', country: 'Colombia', li: 'https://linkedin.com/in/mariana-torres-sales' },
    { fn: 'Valentina', ln: 'Ríos', em: 'valentina.rios@mercadolibre.com', ph: '+549115554422', wa: '+549115554422', title: 'CTO E-Commerce', lead: 'QUALIFIED', score: 86, city: 'Buenos Aires', country: 'Argentina', li: 'https://linkedin.com/in/valentina-rios-cto' },
    { fn: 'David', ln: 'Silva', em: 'david.silva@nubank.com', ph: '+551198887766', wa: '+551198887766', title: 'Head of Procurement', lead: 'CUSTOMER', score: 91, city: 'São Paulo', country: 'Brasil', li: 'https://linkedin.com/in/david-silva-nubank' },
    { fn: 'Camila', ln: 'Ortega', em: 'camila.ortega@rappi.com', ph: '+573109998877', wa: '+573109998877', title: 'VP Commercial Strategy', lead: 'QUALIFIED', score: 79, city: 'Bogotá', country: 'Colombia', li: 'https://linkedin.com/in/camila-ortega-rappi' },
    { fn: 'Alejandro', ln: 'Morales', em: 'a.morales@cloudscale.io', ph: '+14155550199', wa: '+14155550199', title: 'CEO & Founder', lead: 'NEW', score: 65, city: 'San Francisco', country: 'Estados Unidos', li: 'https://linkedin.com/in/alejandro-morales-cloud' },
    { fn: 'Lucía', ln: 'Fernández', em: 'lucia.f@biohealth.org', ph: '+525588883322', wa: '+525588883322', title: 'Directora de Operaciones', lead: 'CONTACTED', score: 73, city: 'Ciudad de México', country: 'México', li: 'https://linkedin.com/in/lucia-fernandez-pharma' },
  ]

  const contactIds: string[] = []
  for (let i = 0; i < contactsData.length; i++) {
    const c = contactsData[i]
    const id = crypto.randomUUID()
    await db.insert(contacts).values({
      id,
      tenantId,
      companyId: companyIds[i % companyIds.length],
      firstName: c.fn,
      lastName: c.ln,
      email: c.em,
      phone: c.ph,
      whatsappNumber: c.wa,
      jobTitle: c.title,
      leadStatus: c.lead as any,
      leadScore: c.score,
      city: c.city,
      country: c.country,
      timezone: 'America/Bogota',
      preferredLanguage: 'ES',
      linkedinUrl: c.li,
      loyaltyPoints: (i + 1) * 350,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
    contactIds.push(id)

    await db.insert(contactTags).values({
      contactId: id,
      tagId: tagIds[i % tagIds.length],
      tenantId,
    }).onConflictDoNothing()
  }

  // 5. Sales Pipelines & Stages
  const pipelineId = crypto.randomUUID()
  await db.insert(pipelines).values({
    id: pipelineId,
    tenantId,
    name: 'Pipeline B2B Enterprise 2026',
    createdAt: now,
  }).onConflictDoNothing()

  const stages = [
    { name: '1. Lead Calificado (Inbound)', prob: 20, order: 1, won: false, lost: false },
    { name: '2. Demo & Descubrimiento', prob: 40, order: 2, won: false, lost: false },
    { name: '3. Propuesta CPQ Enviada', prob: 60, order: 3, won: false, lost: false },
    { name: '4. Negociación & Legal', prob: 80, order: 4, won: false, lost: false },
    { name: '5. Cerrado Ganado (Won)', prob: 100, order: 5, won: true, lost: false },
  ]
  const stageIds: string[] = []
  for (const s of stages) {
    const id = crypto.randomUUID()
    await db.insert(pipelineStages).values({
      id,
      tenantId,
      pipelineId,
      name: s.name,
      probabilityPercent: s.prob,
      displayOrder: s.order,
      isWonStage: s.won,
      isLostStage: s.lost,
      createdAt: now,
    }).onConflictDoNothing()
    stageIds.push(id)
  }

  // 6. Real Deals with Currency & Forecasting
  const dealData = [
    { name: 'Stripe LATAM — Nexora Enterprise Core + AI Radar', amt: '85000', curr: 'USD', stg: 4, stat: 'WON', cat: 'CLOSED' },
    { name: 'MercadoLibre — Migración Cloud & Helpdesk Omnicanal', amt: '145000', curr: 'USD', stg: 3, stat: 'OPEN', cat: 'COMMIT' },
    { name: 'Nubank — Licencia Anual 250 Asientos + CPQ Dedicated', amt: '120000', curr: 'USD', stg: 4, stat: 'WON', cat: 'CLOSED' },
    { name: 'Rappi — Automatización Comercial & Lead Scoring Engine', amt: '48000', curr: 'USD', stg: 2, stat: 'OPEN', cat: 'BEST_CASE' },
    { name: 'CloudScale — Integración API Gateway & Webhooks', amt: '32000', curr: 'USD', stg: 1, stat: 'OPEN', cat: 'PIPELINE' },
    { name: 'BioHealth — Suite Personal CRM + Base de Conocimiento', amt: '28000', curr: 'USD', stg: 0, stat: 'OPEN', cat: 'PIPELINE' },
  ]
  const dealIds: string[] = []
  for (let i = 0; i < dealData.length; i++) {
    const d = dealData[i]
    const id = crypto.randomUUID()
    await db.insert(deals).values({
      id,
      tenantId,
      pipelineId,
      stageId: stageIds[d.stg],
      contactId: contactIds[i % contactIds.length],
      companyId: companyIds[i % companyIds.length],
      name: d.name,
      amount: d.amt,
      currency: d.curr,
      forecastCategory: d.cat as any,
      status: d.stat as any,
      expectedCloseDate: new Date(Date.now() + (30 + i * 15) * 86400000).toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
    dealIds.push(id)
  }

  return { companyIds, contactIds, tagIds, pipelineId, stageIds, dealIds }
}
