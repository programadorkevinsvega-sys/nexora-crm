import { Injectable, NotFoundException } from '@nestjs/common'
import { eq, and, desc } from 'drizzle-orm'
import {
  getDb,
  aiDealPredictions,
  aiGeneratedDrafts,
  deals,
  contacts,
  companies,
  quotes,
  calls,
  emails,
  whatsappMessages,
  supportTickets,
} from '@crm/database'
import { AiRepository } from '../domain/repositories/ai.repository'
import { DealWinPrediction, DealHealthStatus } from '../domain/entities/deal-win-prediction.entity'
import {
  GeneratedDraft,
  MessageChannel,
  MessageTone,
  MessageObjective,
} from '../domain/entities/generated-draft.entity'
import { ContactExecutiveSummary, RelationshipSentiment } from '../domain/entities/contact-summary.entity'
import { ChurnRiskPrediction, ChurnRiskTier } from '../domain/entities/churn-prediction.entity'

@Injectable()
export class DrizzleAiRepository extends AiRepository {
  private get db() {
    return getDb()
  }

  async predictDealWinProbability(tenantId: string, dealId: string): Promise<DealWinPrediction> {
    const dealRows = await this.db.select().from(deals).where(and(eq(deals.tenantId, tenantId), eq(deals.id, dealId))).limit(1)
    if (dealRows.length === 0) {
      throw new NotFoundException(`Deal with id ${dealId} not found`)
    }
    const deal = dealRows[0]
    const amount = Number(deal.amount || 0)

    const [dealQuotes, dealCalls, dealEmails, dealWhatsapp] = await Promise.all([
      this.db.select().from(quotes).where(and(eq(quotes.tenantId, tenantId), eq(quotes.dealId, dealId))),
      deal.contactId ? this.db.select().from(calls).where(eq(calls.contactId, deal.contactId)) : [],
      deal.contactId ? this.db.select().from(emails).where(eq(emails.contactId, deal.contactId)) : [],
      deal.contactId ? this.db.select().from(whatsappMessages).where(eq(whatsappMessages.contactId, deal.contactId)) : [],
    ])

    let prob = 35
    const positive: string[] = []
    const risks: string[] = []
    const actions: string[] = []

    if (deal.status === 'WON') {
      prob = 100
      positive.push('Oportunidad ganada y cerrada exitosamente (+100%)')
    } else if (deal.status === 'LOST') {
      prob = 0
      risks.push('Oportunidad marcada como perdida (0%)')
    } else {
      if (dealQuotes.length > 0) {
        const approved = dealQuotes.some((q) => q.status === 'APPROVED' || q.status === 'ACCEPTED')
        if (approved) {
          prob += 35
          positive.push('Cotización comercial CPQ aprobada por el cliente (+35%)')
        } else {
          prob += 15
          positive.push('Propuesta comercial enviada (+15%)')
        }
      } else {
        risks.push('Aún no se ha generado una propuesta o cotización CPQ formal (-15%)')
        actions.push('Generar y enviar una cotización personalizada con catálogo de productos')
      }

      const totalInteractions = dealCalls.length + dealEmails.length + dealWhatsapp.length
      if (totalInteractions >= 4) {
        prob += 15
        positive.push(`Alto nivel de interacción omnicanal (${totalInteractions} interacciones registradas) (+15%)`)
      } else if (totalInteractions === 0) {
        prob -= 20
        risks.push('Cero interacciones recientes registradas con el contacto (-20%)')
        actions.push('Programar una llamada de descubrimiento inmediata con el tomador de decisiones')
      }

      if (amount > 10000) {
        prob += 10
        positive.push('Deal de alto valor estratégico para la empresa (+10%)')
        actions.push('Involucrar al Director Comercial para reunión ejecutiva de cierre')
      }

      prob = Math.max(5, Math.min(95, prob))
    }

    let health: DealHealthStatus = 'GOOD'
    if (prob >= 75) health = 'EXCELLENT'
    else if (prob >= 50) health = 'GOOD'
    else if (prob >= 30) health = 'WARNING'
    else health = 'CRITICAL'

    const predDate = new Date()
    predDate.setDate(predDate.getDate() + 15)

    const prediction = new DealWinPrediction(
      crypto.randomUUID(),
      tenantId,
      dealId,
      deal.name,
      amount,
      prob,
      health,
      positive,
      risks,
      actions.length > 0 ? actions : ['Continuar con el plan de seguimiento estándar'],
      predDate.toISOString().split('T')[0],
      new Date(),
    )

    // Save to DB
    await this.db
      .insert(aiDealPredictions)
      .values({
        id: prediction.id,
        tenantId,
        dealId,
        winProbabilityPercent: prediction.winProbabilityPercent,
        dealHealth: prediction.dealHealth,
        positiveFactors: prediction.positiveFactors,
        riskFactors: prediction.riskFactors,
        recommendedNextActions: prediction.recommendedNextActions,
      })
      .onConflictDoUpdate({
        target: [aiDealPredictions.tenantId, aiDealPredictions.dealId],
        set: {
          winProbabilityPercent: prediction.winProbabilityPercent,
          dealHealth: prediction.dealHealth,
          positiveFactors: prediction.positiveFactors,
          riskFactors: prediction.riskFactors,
          recommendedNextActions: prediction.recommendedNextActions,
          updatedAt: new Date(),
        },
      })

    return prediction
  }

  async generateMessageDraft(
    tenantId: string,
    params: {
      contactId?: string
      dealId?: string
      channel: MessageChannel
      tone: MessageTone
      objective: MessageObjective
      customInstructions?: string
    },
  ): Promise<GeneratedDraft> {
    let contactName = 'Estimado cliente'
    let companyName = 'su empresa'
    let dealName = 'nuestra propuesta'

    if (params.contactId) {
      const c = await this.db.select().from(contacts).where(eq(contacts.id, params.contactId)).limit(1)
      if (c.length > 0) {
        contactName = `${c[0].firstName} ${c[0].lastName ?? ''}`.trim()
        if (c[0].companyId) {
          const comp = await this.db.select().from(companies).where(eq(companies.id, c[0].companyId)).limit(1)
          if (comp.length > 0) companyName = comp[0].name
        }
      }
    }

    if (params.dealId) {
      const d = await this.db.select().from(deals).where(eq(deals.id, params.dealId)).limit(1)
      if (d.length > 0) dealName = d[0].name
    }

    let subject: string | null = null
    let body = ''

    if (params.objective === 'FOLLOW_UP') {
      subject = `Seguimiento sobre ${dealName} - Nexus CRM`
      body = `Hola ${contactName},\n\nEspero que te encuentres muy bien. Te escribo para dar seguimiento a nuestra conversación sobre ${dealName} para ${companyName}.\n\n¿Tienes alguna duda sobre la propuesta o te gustaría que coordinemos una breve llamada de 10 minutos esta semana?\n\nQuedo atento a tus comentarios.\n\nSaludos cordiales,\nEquipo Comercial`
    } else if (params.objective === 'PROPOSAL_INTRODUCTION') {
      subject = `Propuesta Comercial Personalizada: ${dealName}`
      body = `Estimado/a ${contactName},\n\nAdjunto te compartimos los detalles de la propuesta comercial que preparamos para ${companyName}.\n\nHemos diseñado esta solución adaptada a tus requerimientos operativos para maximizar el retorno de inversión.\n\nQuedamos a tu entera disposición para resolver cualquier inquietud.\n\nAtentamente,\nEquipo de Soluciones`
    } else if (params.objective === 'CONTRACT_SIGNING') {
      subject = `Documentos listos para firma electrónica - ${dealName}`
      body = `Hola ${contactName},\n\nTe informamos que el contrato para ${dealName} ya se encuentra generado y disponible para su revisión y firma digital a través de nuestro portal de autoservicio.\n\nPuedes acceder de manera segura para completar el proceso en pocos clics.\n\nCualquier duda, estamos a la orden.\n\nSaludos,\nEquipo Legal y Comercial`
    } else if (params.objective === 'PAYMENT_REMINDER') {
      subject = `Aviso amigable de facturación - ${companyName}`
      body = `Estimado/a ${contactName},\n\nTe recordamos cordialmente que la factura correspondiente a los servicios de ${dealName} se encuentra próxima a vencer.\n\nPuedes consultar el estado y comprobantes directamente en tu portal de cliente.\n\nAgradecemos de antemano tu gestión.\n\nCordialmente,\nDepartamento de Facturación`
    } else {
      subject = `Novedades exclusivas para ${companyName}`
      body = `Hola ${contactName},\n\nHace un tiempo no conversamos y queríamos compartirte las últimas mejoras y automatizaciones que podrían impulsar la productividad de ${companyName}.\n\n¿Te gustaría que agendemos un breve espacio virtual?\n\nUn saludo cordial,\nEquipo de Éxito del Cliente`
    }

    if (params.customInstructions) {
      body += `\n\n[Nota personalizada: ${params.customInstructions}]`
    }

    const draft = new GeneratedDraft(
      crypto.randomUUID(),
      tenantId,
      params.contactId ?? null,
      params.dealId ?? null,
      params.channel,
      params.tone,
      params.objective,
      subject,
      body,
      Math.round(body.length / 4),
      new Date(),
    )

    await this.db.insert(aiGeneratedDrafts).values({
      id: draft.id,
      tenantId,
      contactId: draft.contactId,
      dealId: draft.dealId,
      channel: draft.channel,
      tone: draft.tone,
      objective: draft.objective,
      subject: draft.subject,
      generatedBody: draft.bodyText,
    })

    return draft
  }

  async generateContactExecutiveSummary(tenantId: string, contactId: string): Promise<ContactExecutiveSummary> {
    const contactRows = await this.db.select().from(contacts).where(and(eq(contacts.tenantId, tenantId), eq(contacts.id, contactId))).limit(1)
    if (contactRows.length === 0) {
      throw new NotFoundException(`Contact ${contactId} not found`)
    }
    const c = contactRows[0]
    const fullName = `${c.firstName} ${c.lastName ?? ''}`.trim()

    const [contactDeals, tickets] = await Promise.all([
      this.db.select().from(deals).where(eq(deals.contactId, contactId)),
      this.db.select().from(supportTickets).where(eq(supportTickets.contactId, contactId)),
    ])

    const openTickets = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length
    let sentiment: RelationshipSentiment = 'POSITIVE'
    const painPoints: string[] = []

    if (openTickets > 1) {
      sentiment = 'NEGATIVE'
      painPoints.push(`${openTickets} tickets de soporte sin resolver generando fricción`)
    } else if (openTickets === 1) {
      sentiment = 'NEUTRAL'
      painPoints.push('1 caso de soporte en atención')
    } else {
      painPoints.push('Interacciones fluidas sin incidentes técnicos pendientes')
    }

    const summaryText = `El contacto ${fullName} mantiene una relación activa con ${contactDeals.length} oportunidades comerciales y ${tickets.length} interacciones de soporte registradas. El balance global de satisfacción es ${sentiment.toLowerCase()}.`
    const recStrategy = openTickets > 0
      ? 'Priorizar la resolución técnica de sus tickets abiertos antes de realizar nuevas ofertas comerciales.'
      : 'Presentar propuestas de expansión (Upsell) enfocadas en automatizaciones avanzadas de Nexus CRM.'

    return new ContactExecutiveSummary(contactId, fullName, summaryText, sentiment, painPoints, recStrategy, new Date())
  }

  async predictChurnRisk(tenantId: string, contactId: string): Promise<ChurnRiskPrediction> {
    const contactRows = await this.db.select().from(contacts).where(and(eq(contacts.tenantId, tenantId), eq(contacts.id, contactId))).limit(1)
    if (contactRows.length === 0) {
      throw new NotFoundException(`Contact ${contactId} not found`)
    }
    const c = contactRows[0]
    const fullName = `${c.firstName} ${c.lastName ?? ''}`.trim()

    const tickets = await this.db.select().from(supportTickets).where(eq(supportTickets.contactId, contactId))
    const openTickets = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length

    let riskPercent = 15
    const indicators: string[] = []
    const actions: string[] = []

    if (openTickets >= 2) {
      riskPercent += 40
      indicators.push(`Múltiples tickets abiertos (${openTickets}) aumentan el riesgo de frustración (+40%)`)
      actions.push('Asignar un agente Senior para resolver de inmediato los tickets')
    }
    if (riskPercent < 20) {
      indicators.push('Baja tasa de incidentes y uso saludable del servicio')
      actions.push('Mantener el programa de fidelización y seguimiento trimestral')
    }

    let level: ChurnRiskTier = 'LOW'
    if (riskPercent >= 60) level = 'HIGH'
    else if (riskPercent >= 35) level = 'MEDIUM'

    return new ChurnRiskPrediction(contactId, fullName, riskPercent, level, indicators, actions, new Date())
  }
}
