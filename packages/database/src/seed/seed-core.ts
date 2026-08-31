import { getDb } from '@crm/database'
import {
  tenants, branches, tenantBranding, systemModules,
  tenantLanguages, tenantCurrencies,
  companies, contacts, tags, contactTags,
  pipelines, pipelineStages, deals,
} from '@crm/database'

export async function seedCoreData(db: ReturnType<typeof getDb>, tenantId: string, ownerUserId: string) {
  const now = new Date()

  // 1. Tenant & Organization Structure
  await db.insert(tenants).values({
    id: tenantId,
    name: 'Nexus Enterprise Demo Corp',
    legalName: 'Nexus Enterprise Global Solutions S.A.S.',
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
    primaryColor: '#3B82F6',
    secondaryColor: '#0F172A',
    updatedAt: now,
  }).onConflictDoNothing()

  await db.insert(tenantLanguages).values({
    id: crypto.randomUUID(),
    tenantId,
    isoCode: 'es',
    name: 'Español (Latinoamérica)',
    isDefault: true,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing()

  await db.insert(tenantCurrencies).values({
    id: crypto.randomUUID(),
    tenantId,
    isoCode: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    isBaseCurrency: true,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing()

  // 2. B2B Enterprise Companies
  const companyData = [
    { name: 'Stripe Latin America', taxId: '900.100.201-1', ind: 'Fintech & Payments', emp: 1200, web: 'https://stripe.com' },
    { name: 'MercadoLibre Corp', taxId: '900.100.202-2', ind: 'E-commerce & Logistics', emp: 15000, web: 'https://mercadolibre.com' },
    { name: 'Nubank Financial', taxId: '900.100.203-3', ind: 'Digital Banking', emp: 7500, web: 'https://nubank.com' },
    { name: 'Rappi Prime Enterprises', taxId: '900.100.204-4', ind: 'On-Demand Delivery', emp: 4500, web: 'https://rappi.com' },
    { name: 'CloudScale SaaS Platform', taxId: '900.100.205-5', ind: 'Cloud Infrastructure', emp: 650, web: 'https://cloudscale.io' },
    { name: 'BioHealth Pharma Systems', taxId: '900.100.206-6', ind: 'Healthcare & Pharma', emp: 3200, web: 'https://biohealth.org' },
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
    { name: 'High LTV', color: '#F59E0B' },
    { name: 'Renewal Due', color: '#EC4899' },
  ]
  const tagIds: string[] = []
  for (const t of tagList) {
    const id = crypto.randomUUID()
    await db.insert(tags).values({ id, tenantId, name: t.name, color: t.color, createdAt: now }).onConflictDoNothing()
    tagIds.push(id)
  }

  // 4. Contacts
  const contactsData = [
    { fn: 'Carlos', ln: 'Mendoza', em: 'carlos.mendoza@stripe.com', ph: '+57-300-111-2233', title: 'VP de Expansión LATAM', lead: 'CUSTOMER', star: true },
    { fn: 'Valentina', ln: 'Rios', em: 'valentina.rios@mercadolibre.com', ph: '+54-911-555-4422', title: 'Directora de Tecnología (CTO)', lead: 'QUALIFIED', star: true },
    { fn: 'David', ln: 'Silva', em: 'david.silva@nubank.com', ph: '+55-11-9888-7766', title: 'Head of Enterprise Procurement', lead: 'CUSTOMER', star: false },
    { fn: 'Camila', ln: 'Ortega', em: 'camila.ortega@rappi.com', ph: '+57-310-999-8877', title: 'VP of Commercial Strategy', lead: 'QUALIFIED', star: true },
    { fn: 'Alejandro', ln: 'Morales', em: 'a.morales@cloudscale.io', ph: '+1-415-555-0199', title: 'Chief Executive Officer (CEO)', lead: 'NEW', star: false },
    { fn: 'Lucía', ln: 'Fernandez', em: 'lucia.f@biohealth.org', ph: '+52-55-8888-3322', title: 'Directora de Operaciones', lead: 'CONTACTED', star: false },
    { fn: 'Mateo', ln: 'Gomez', em: 'mateo.gomez@stripe.com', ph: '+57-320-444-5566', title: 'Lead Architect', lead: 'CUSTOMER', star: false },
    { fn: 'Sofia', ln: 'Castro', em: 'sofia.castro@mercadolibre.com', ph: '+54-911-333-2211', title: 'Gerente de Proyectos Cloud', lead: 'QUALIFIED', star: true },
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
      jobTitle: c.title,
      identificationType: 'CC',
      identificationNumber: String(10203040 + i),
      birthDate: new Date(1988 + (i % 8), i % 12, (i % 25) + 1).toISOString().split('T')[0],
      streetAddress: `Carrera ${7 + i} # 93 - 4${i}`,
      city: ['Bogotá', 'Buenos Aires', 'São Paulo', 'Ciudad de México'][i % 4],
      country: ['Colombia', 'Argentina', 'Brasil', 'México'][i % 4],
      taxRegime: 'Común',
      isTaxLiable: true,
      leadSource: ['Referral', 'Inbound Web', 'Conferencia Tech'][i % 3],
      leadStatus: c.lead as any,
      loyaltyPoints: (i + 1) * 350,
      isStarred: c.star,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
    contactIds.push(id)

    // Tag contact
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
    { name: '1. Lead Calificado (Inbound)', prob: 20, order: 1 },
    { name: '2. Demo & Descubrimiento', prob: 40, order: 2 },
    { name: '3. Propuesta CPQ Enviada', prob: 60, order: 3 },
    { name: '4. Negociación & Legal', prob: 80, order: 4 },
    { name: '5. Cerrado Ganado (Won)', prob: 100, order: 5 },
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
      createdAt: now,
    }).onConflictDoNothing()
    stageIds.push(id)
  }

  // 6. Real Deals
  const dealData = [
    { name: 'Stripe LATAM — Nexus Enterprise Core + AI Radar', amt: '85000', stg: 4, stat: 'WON' },
    { name: 'MercadoLibre — Migración Cloud & Helpdesk Omnicanal', amt: '145000', stg: 3, stat: 'OPEN' },
    { name: 'Nubank — Licencia Anual 250 Asientos + CPQ Dedicated', amt: '120000', stg: 4, stat: 'WON' },
    { name: 'Rappi — Automatización Comercial & Lead Scoring Engine', amt: '48000', stg: 2, stat: 'OPEN' },
    { name: 'CloudScale — Integración API Gateway & Webhooks', amt: '32000', stg: 1, stat: 'OPEN' },
    { name: 'BioHealth — Suite Personal CRM + Base de Conocimiento', amt: '28000', stg: 0, stat: 'OPEN' },
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
      status: d.stat as any,
      expectedCloseDate: new Date(Date.now() + (30 + i * 15) * 86400000).toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
    dealIds.push(id)
  }

  return { companyIds, contactIds, tagIds, pipelineId, stageIds, dealIds }
}
