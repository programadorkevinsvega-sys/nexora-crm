import { getDb } from '@crm/database'
import {
  relationshipTypes, lifeEvents, contactGifts, contactDebts, contactReminders, contactPets, contactNotes, activities,
  loyaltyProfiles, customerSegments, segmentAssignments, customerMetrics,
  affiliatePrograms, affiliates, affiliateCommissions, affiliatePayouts,
  workflowDefinitions, workflowExecutions, workflowStepExecutions,
  leadScoringRules, leadScores,
  aiDealPredictions, aiGeneratedDrafts,
  apiKeys, webhookEndpoints, webhookDeliveryLogs,
  auditLogs,
} from '@crm/database'

export async function seedAdvancedData(
  db: ReturnType<typeof getDb>,
  tenantId: string,
  contactIds: string[],
  dealIds: string[],
  userIds: string[],
) {
  const now = new Date()

  // 1. Personal CRM
  for (const rel of [{ n: 'Cónyuge / Pareja', r: 'Cónyuge / Pareja' }, { n: 'Socio de Negocios', r: 'Socio de Negocios' }, { n: 'Asistente Ejecutivo', r: 'Director Ejecutivo' }]) {
    await db.insert(relationshipTypes).values({ id: crypto.randomUUID(), tenantId, name: rel.n, reverseName: rel.r, createdAt: now }).onConflictDoNothing()
  }

  await db.insert(lifeEvents).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], eventType: 'BIRTHDAY', name: 'Cumpleaños Carlos Mendoza', description: 'Celebración de 38 años', happenedAt: '1988-09-15', isYearlyRecurring: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(lifeEvents).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[1], eventType: 'ANNIVERSARY', name: 'Aniversario en MercadoLibre', description: '5 años como CTO', happenedAt: '2021-04-10', isYearlyRecurring: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(contactGifts).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], direction: 'GIVEN', name: 'Cesta Gourmet Premium de Café Colombiano', estimatedValue: '180', status: 'GIVEN', dateGivenOrReceived: now.toISOString().split('T')[0], createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(contactDebts).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[1], direction: 'OWED', amount: '500.00', reason: 'Anticipo de consultoría Cloud', status: 'UNPAID', dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(contactReminders).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], title: 'Llamada trimestral de agradecimiento y relación', frequencyType: 'MONTHLY', frequencyInterval: 1, nextDueDate: new Date(Date.now() + 14 * 86400000), isActive: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(contactPets).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], petCategory: 'DOG', name: 'Luna', breed: 'Border Collie', createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(contactNotes).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], body: 'Prefiere contacto por WhatsApp para temas rápidos y email para cotizaciones.', isFavorite: true, createdByUserId: userIds[0], createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(activities).values({ id: crypto.randomUUID(), tenantId, activityType: 'MEETING', summary: 'Reunión ejecutiva sobre estrategia comercial', happenedAt: now.toISOString().split('T')[0], createdAt: now, updatedAt: now }).onConflictDoNothing()

  // 2. Loyalty & Segments
  for (let i = 0; i < contactIds.length; i++) {
    await db.insert(loyaltyProfiles).values({
      id: crypto.randomUUID(),
      tenantId,
      contactId: contactIds[i],
      loyaltyPointsBalance: (i + 1) * 850,
      tierLevel: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'][i % 4],
      totalLifetimeValue: String(15000 + i * 12000),
      totalPurchasesCount: 4 + i * 3,
      averageOrderValue: String(3500 + i * 400),
      lastPurchaseDate: now.toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  const hvcId = crypto.randomUUID()
  await db.insert(customerSegments).values({ id: hvcId, tenantId, name: 'Clientes VIP (LTV > $50K)', description: 'Cuentas estratégicas de alto volumen', isDynamic: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(customerSegments).values({ id: crypto.randomUUID(), tenantId, name: 'Prospectos Calientes Q3', description: 'Deals en etapa de negociación', isDynamic: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(segmentAssignments).values({ id: crypto.randomUUID(), tenantId, segmentId: hvcId, contactId: contactIds[0], assignedAt: now }).onConflictDoNothing()
  await db.insert(customerMetrics).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[0], churnRiskScore: '0.02', rfmScore: '555', npsScore: 10, customerSatisfactionScore: '4.9', calculatedAt: now }).onConflictDoNothing()
  await db.insert(customerMetrics).values({ id: crypto.randomUUID(), tenantId, contactId: contactIds[1], churnRiskScore: '0.12', rfmScore: '445', npsScore: 9, customerSatisfactionScore: '4.5', calculatedAt: now }).onConflictDoNothing()

  // 3. Affiliates
  const existingProg = await db.query.affiliatePrograms?.findFirst?.({
    where: (table: any, { and, eq }: any) => and(eq(table.tenantId, tenantId), eq(table.name, 'Programa de Partners & Referidos Enterprise')),
  }).catch(() => null)
  const progId = existingProg?.id || crypto.randomUUID()
  if (!existingProg) {
    await db.insert(affiliatePrograms).values({ id: progId, tenantId, name: 'Programa de Partners & Referidos Enterprise', commissionType: 'PERCENTAGE', commissionValue: '20', cookieDurationDays: 60, isMultiLevel: false, isActive: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  }

  const existingAff = await db.query.affiliates?.findFirst?.({
    where: (table: any, { and, eq }: any) => and(eq(table.tenantId, tenantId), eq(table.referralCode, 'NEXORA-VIP')),
  }).catch(() => null)
  const affId = existingAff?.id || crypto.randomUUID()
  if (!existingAff) {
    await db.insert(affiliates).values({ id: affId, tenantId, programId: progId, customerId: contactIds[0], referralCode: 'NEXORA-VIP', referralLink: 'https://nexoracrm.com/ref/NEXORA-VIP', status: 'ACTIVE', totalEarnings: '4500.00', createdAt: now, updatedAt: now }).onConflictDoNothing()
  }

  await db.insert(affiliateCommissions).values({ id: crypto.randomUUID(), tenantId, affiliateId: affId, sourceOrderId: crypto.randomUUID(), commissionAmount: '900.00', mlmLevelEarned: 0, status: 'APPROVED', approvedAt: now, createdAt: now }).onConflictDoNothing()
  await db.insert(affiliatePayouts).values({ id: crypto.randomUUID(), tenantId, affiliateId: affId, amount: '1800.00', paymentMethod: 'BANK_TRANSFER', status: 'COMPLETED', paidAt: now, createdAt: now }).onConflictDoNothing()

  // 4. Lead Scoring Rules & Scores
  await db.insert(leadScoringRules).values({ id: crypto.randomUUID(), tenantId, name: 'Visita recurrente a página de Precios CPQ', category: 'BEHAVIORAL', condition: { field: 'page_views', operator: 'gte', value: 3 }, points: 25, isActive: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  await db.insert(leadScoringRules).values({ id: crypto.randomUUID(), tenantId, name: 'Empresa con más de 100 empleados', category: 'DEMOGRAPHIC', condition: { field: 'employees', operator: 'gte', value: 100 }, points: 30, isActive: true, createdAt: now, updatedAt: now }).onConflictDoNothing()
  for (let i = 0; i < contactIds.length; i++) {
    await db.insert(leadScores).values({
      id: crypto.randomUUID(),
      tenantId,
      contactId: contactIds[i],
      score: 85 - i * 8,
      temperature: i < 3 ? 'HOT' : i < 6 ? 'WARM' : 'COLD',
      lastActivityAt: now,
      history: [{ action: 'Regla de scoring aplicada', points: 25, date: now.toISOString() }],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  // 5. Automations / Workflows
  const existingWf = await db.query.workflowDefinitions?.findFirst?.({
    where: (table: any, { and, eq }: any) => and(eq(table.tenantId, tenantId), eq(table.name, 'Asignación Automática de Leads Enterprise')),
  }).catch(() => null)
  const wfId = existingWf?.id || crypto.randomUUID()
  if (!existingWf) {
    await db.insert(workflowDefinitions).values({
      id: wfId,
      tenantId,
      name: 'Asignación Automática de Leads Enterprise',
      description: 'Enruta leads con scoring alto directamente al VP Comercial.',
      version: 1,
      status: 'ACTIVE',
      triggerEvent: 'crm.contact.created',
      triggerFilter: { leadScoreGte: 50 },
      stepsGraph: { nodes: [{ id: '1', type: 'ACTION', action: 'ASSIGN_USER' }] },
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  const execId = crypto.randomUUID()
  await db.insert(workflowExecutions).values({
    id: execId,
    tenantId,
    workflowId: wfId,
    version: 1,
    entityType: 'contact',
    entityId: contactIds[0],
    status: 'COMPLETED',
    currentStepId: '1',
    startedAt: now,
    completedAt: now,
  }).onConflictDoNothing()

  await db.insert(workflowStepExecutions).values({
    id: crypto.randomUUID(),
    tenantId,
    executionId: execId,
    stepId: '1',
    idempotencyKey: `step-exec-${crypto.randomUUID()}`,
    status: 'SUCCESS',
    attempts: 1,
    startedAt: now,
    completedAt: now,
  }).onConflictDoNothing()

  // 6. AI Predictor & Copilot
  for (let i = 0; i < Math.min(dealIds.length, 3); i++) {
    await db.insert(aiDealPredictions).values({
      id: crypto.randomUUID(),
      tenantId,
      dealId: dealIds[i],
      winProbabilityPercent: [92, 78, 64][i],
      dealHealth: ['EXCELLENT', 'GOOD', 'WARNING'][i],
      positiveFactors: ['Cotización CPQ aprobada', 'Múltiples llamadas ejecutivas', 'Presupuesto confirmado'],
      riskFactors: ['Competidor activo en licitación', 'Plazo de firma cercano'],
      recommendedNextActions: ['Agendar sesión de revisión técnica con arquitectos', 'Enviar caso de éxito'],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  await db.insert(aiGeneratedDrafts).values({
    id: crypto.randomUUID(),
    tenantId,
    contactId: contactIds[0],
    dealId: dealIds[0],
    channel: 'EMAIL',
    tone: 'PERSUASIVE',
    objective: 'Cierre de propuesta enterprise',
    subject: 'Nexora CRM — Confirmación de Términos y Próximos Pasos para Despliegue',
    generatedBody: 'Estimado Carlos,\n\nFue un placer conversar hoy. Como acordamos, adjuntamos la propuesta formal con el SLA 24/7 y el nodo PostgreSQL dedicado.\n\nQuedamos a tu entera disposición para dar inicio al onboarding.\n\nSaludos cordiales,\nEquipo Nexora Enterprise',
    createdAt: now,
  }).onConflictDoNothing()

  // 7. Developer Portal (API Keys & Webhooks)
  await db.insert(apiKeys).values({
    id: crypto.randomUUID(),
    tenantId,
    name: 'Integración Producción ERP / Web',
    keyHash: '40d22a3009c447282b056a9c2c91ff64b1503f235514c22bd25266b9ac26c404',
    keyPrefix: 'nex_live_b4774af...',
    scopes: ['contacts:read', 'contacts:write', 'deals:read', 'deals:write', 'tickets:read', 'quotes:read', 'webhooks:manage'],
    isActive: true,
    lastUsedAt: now,
    expiresAt: new Date(Date.now() + 365 * 86400000),
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing()

  const existingWh = await db.query.webhookEndpoints?.findFirst?.({
    where: (table: any, { and, eq }: any) => and(eq(table.tenantId, tenantId), eq(table.name, 'Webhook Servidor Corporativo')),
  }).catch(() => null)
  const whId = existingWh?.id || crypto.randomUUID()
  if (!existingWh) {
    await db.insert(webhookEndpoints).values({
      id: whId,
      tenantId,
      name: 'Webhook Servidor Corporativo',
      url: 'https://api.empresa.com/webhooks/nexora-events',
      secret: 'whsec_99a8b7c6d5e4f3a2b1c099887766554433221100aabbccddeeff001122334455',
      events: ['contact.created', 'deal.stage_changed', 'deal.won', 'quote.accepted', 'contract.signed'],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  await db.insert(webhookDeliveryLogs).values({
    id: crypto.randomUUID(),
    tenantId,
    endpointId: whId,
    event: 'deal.won',
    payload: { dealId: dealIds[0], amount: 85000, currency: 'USD', status: 'WON' },
    responseStatus: 200,
    responseBody: '{"received": true}',
    durationMs: 142,
    attempt: 1,
    status: 'SUCCESS',
    deliveredAt: now,
    createdAt: now,
  }).onConflictDoNothing()

  // 8. Audit Logs
  for (let i = 0; i < 5; i++) {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      tenantId,
      entityType: ['Deal', 'Contact', 'Quote', 'Contract', 'ApiKey'][i],
      entityId: crypto.randomUUID(),
      action: ['CREATE', 'UPDATE', 'APPROVE', 'SIGN', 'GENERATE'][i],
      fieldName: ['status', 'stageId', 'discount', 'mrrValue', 'scopes'][i],
      oldValue: ['DRAFT', 'Proposal', '0%', '0', '[]'][i],
      newValue: ['WON', 'Closed Won', '15%', '7500', '["all"]'][i],
      changedByUserId: userIds[0],
      moduleName: ['deals', 'contacts', 'quotes', 'contracts', 'developer'][i],
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/152.0.0.0 Safari/537.36',
      createdAt: new Date(Date.now() - (i * 3600000)),
    }).onConflictDoNothing()
  }
}
