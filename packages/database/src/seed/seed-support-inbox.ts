import { getDb } from '@crm/database'
import {
  notes, tasks, calls,
  supportTickets, ticketReplies, ticketStatuses, ticketPriorities, ticketCategories, agentProfiles,
  helpdeskMailboxes, helpdeskConversations,
  knowledgeBaseCategories, knowledgeBaseArticles,
} from '@crm/database'

export async function seedSupportInboxData(
  db: ReturnType<typeof getDb>,
  tenantId: string,
  contactIds: string[],
  userIds: string[],
) {
  const now = new Date()

  // 1. Interactions (Notes, Tasks, Calls)
  const noteList = [
    'Reunión ejecutiva con CTO: confirmaron interés en el módulo de AI Copilot para sus 50 agentes.',
    'Revisión legal completada. Solicitan incluir cláusula de disponibilidad del 99.95% con compensación.',
    'Feedback del equipo de ventas: la integración con WhatsApp y la vista Kanban de Deals es excelente.',
    'Seguimiento a renovación anual de contrato: agendada demo de las nuevas funcionalidades para el viernes.',
  ]
  for (let i = 0; i < noteList.length; i++) {
    await db.insert(notes).values({
      id: crypto.randomUUID(),
      tenantId,
      contactId: contactIds[i % contactIds.length],
      content: noteList[i],
      authorUserId: userIds[0],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  const taskList = [
    { title: 'Enviar borrador de cotización CPQ con 15% de descuento aprobado', due: 2 },
    { title: 'Llamada de alineación técnica con equipo de DevOps y Seguridad', due: 4 },
    { title: 'Revisar métricas de Lead Scoring y calibrar pesos de interacción', due: 6 },
    { title: 'Capacitación presencial en sede Bogotá sobre Omnichannel Inbox', due: 10 },
  ]
  for (let i = 0; i < taskList.length; i++) {
    await db.insert(tasks).values({
      id: crypto.randomUUID(),
      tenantId,
      contactId: contactIds[i % contactIds.length],
      title: taskList[i].title,
      dueDate: new Date(Date.now() + taskList[i].due * 86400000),
      assignedUserId: userIds[i % userIds.length],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  await db.insert(calls).values({
    id: crypto.randomUUID(),
    tenantId,
    contactId: contactIds[0],
    callType: 'OUTBOUND',
    durationSeconds: 960,
    summary: 'Llamada de negociación de términos comerciales y SLAs de soporte 24/7.',
    happenedAt: now,
    authorUserId: userIds[0],
    createdAt: now,
  }).onConflictDoNothing()

  // 2. Helpdesk ITSM Statuses & Priorities
  for (const s of [
    { name: 'Abierto', color: '#3B82F6', closed: false, order: 1 },
    { name: 'En Atención', color: '#F59E0B', closed: false, order: 2 },
    { name: 'Esperando al Cliente', color: '#8B5CF6', closed: false, order: 3 },
    { name: 'Resuelto', color: '#10B981', closed: true, order: 4 },
  ]) {
    await db.insert(ticketStatuses).values({
      id: crypto.randomUUID(),
      tenantId,
      name: s.name,
      colorHex: s.color,
      isClosedState: s.closed,
      sortOrder: s.order,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  for (const p of [
    { name: 'Baja', level: 1, color: '#10B981', resp: 24, resol: 72 },
    { name: 'Normal', level: 2, color: '#3B82F6', resp: 8, resol: 24 },
    { name: 'Alta', level: 3, color: '#F59E0B', resp: 4, resol: 12 },
    { name: 'Urgente (SLA Crítico)', level: 4, color: '#EF4444', resp: 1, resol: 4 },
  ]) {
    await db.insert(ticketPriorities).values({
      id: crypto.randomUUID(),
      tenantId,
      name: p.name,
      level: p.level,
      colorHex: p.color,
      slaFirstResponseHours: p.resp,
      slaResolutionHours: p.resol,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  for (const cat of ['Integración & Webhooks API', 'Facturación & Pagos CPQ', 'Configuración SSO / IAM', 'Consultoría de Procesos']) {
    await db.insert(ticketCategories).values({
      id: crypto.randomUUID(),
      tenantId,
      name: cat,
      description: `Tickets relacionados con ${cat}`,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  await db.insert(agentProfiles).values({
    id: crypto.randomUUID(),
    tenantId,
    userId: userIds[1] || userIds[0],
    isAvailable: true,
    agentStatus: 'AVAILABLE',
    activeTicketsCount: 3,
    resolvedTicketsCount: 42,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing()

  // 3. Support Tickets & Replies
  const ticketData = [
    { subj: 'Duda sobre firma electrónica HMAC en Webhook de Deals', prio: 'HIGH', stat: 'OPEN' },
    { subj: 'Solicitud de ampliación de límite de llamadas a la API v1', prio: 'NORMAL', stat: 'IN_PROGRESS' },
    { subj: 'Error al exportar reporte de Cohortes de Retención', prio: 'LOW', stat: 'RESOLVED' },
    { subj: 'Configuración de credenciales de OpenAI / Ollama Local', prio: 'NORMAL', stat: 'OPEN' },
  ]
  const ticketIds: string[] = []
  for (let i = 0; i < ticketData.length; i++) {
    const t = ticketData[i]
    const id = crypto.randomUUID()
    await db.insert(supportTickets).values({
      id,
      tenantId,
      contactId: contactIds[i % contactIds.length],
      subject: t.subj,
      description: `Detalle completo del caso: ${t.subj}`,
      status: t.stat,
      priority: t.prio,
      assignedUserId: userIds[1] || userIds[0],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
    ticketIds.push(id)

    await db.insert(ticketReplies).values({
      id: crypto.randomUUID(),
      tenantId,
      ticketId: id,
      authorType: 'CUSTOMER',
      authorId: contactIds[i % contactIds.length],
      message: `Hola equipo, estamos presentando una consulta: ${t.subj}. Agradecemos su pronta ayuda.`,
      createdAt: now,
    }).onConflictDoNothing()

    await db.insert(ticketReplies).values({
      id: crypto.randomUUID(),
      tenantId,
      ticketId: id,
      authorType: 'AGENT',
      authorId: userIds[0],
      message: '¡Hola! Con gusto estamos revisando tu solicitud. Te mantendremos informado en este hilo.',
      createdAt: new Date(Date.now() + 1800000),
    }).onConflictDoNothing()
  }

  // 4. Helpdesk Mailboxes & Conversations
  const mailboxId = crypto.randomUUID()
  await db.insert(helpdeskMailboxes).values({
    id: mailboxId,
    tenantId,
    name: 'Mesa de Ayuda Principal',
    emailAddress: 'soporte@nexoracrm.com',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing()

  const convList = [
    { subj: 'Consulta sobre precios de licencias adicionales', email: 'carlos.mendoza@stripe.com' },
    { subj: 'Pregunta técnica sobre Webhooks en tiempo real', email: 'valentina.rios@mercadolibre.com' },
    { subj: 'Confirmación de pago de suscripción mensual', email: 'david.silva@nubank.com' },
  ]
  for (const conv of convList) {
    await db.insert(helpdeskConversations).values({
      id: crypto.randomUUID(),
      tenantId,
      mailboxId,
      subject: conv.subj,
      customerEmail: conv.email,
      assigneeUserId: userIds[0],
      status: 'OPEN',
      priority: 'NORMAL',
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  // 5. Knowledge Base (Categories & Articles)
  const kbCatData = [
    { name: 'Guía de Inicio & Configuración', slug: 'inicio-configuracion', icon: 'book-open' },
    { name: 'API de Desarrolladores & Webhooks', slug: 'api-webhooks', icon: 'code' },
    { name: 'Facturación, Cotizaciones & CPQ', slug: 'facturacion-cpq', icon: 'receipt' },
    { name: 'Seguridad, Roles & Multi-Tenancy', slug: 'seguridad-roles', icon: 'shield-check' },
  ]
  for (const cat of kbCatData) {
    const catId = crypto.randomUUID()
    await db.insert(knowledgeBaseCategories).values({
      id: catId,
      tenantId,
      name: cat.name,
      slug: cat.slug,
      description: `Artículos y documentación sobre ${cat.name}`,
      icon: cat.icon,
      isPublic: true,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()

    await db.insert(knowledgeBaseArticles).values({
      id: crypto.randomUUID(),
      tenantId,
      categoryId: catId,
      title: `Introducción a ${cat.name}`,
      slug: `intro-${cat.slug}`,
      summary: `Aprende todo lo necesario para dominar ${cat.name} en Nexora CRM.`,
      contentMarkdown: `# ${cat.name}\n\nBienvenido a la guía oficial de **${cat.name}**.\n\n### Aspectos Clave:\n- Configuración paso a paso en pocos minutos.\n- Integración directa con gRPC y Next.js 16.\n- Seguridad multi-tenant con Row-Level Security (RLS).\n\nPara dudas adicionales, contacta a nuestro equipo en el Helpdesk.`,
      isPublished: true,
      viewCount: 142,
      helpfulVotes: 28,
      unhelpfulVotes: 1,
      tags: ['Guía', 'Oficial', 'NexoraCRM'],
      authorName: 'Equipo de Soporte Nexora',
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }
}
