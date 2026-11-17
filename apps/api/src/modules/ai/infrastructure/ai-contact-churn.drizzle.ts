import { NotFoundException } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import {
  getDb,
  deals,
  contacts,
  supportTickets,
} from '@crm/database'
import { ContactExecutiveSummary, RelationshipSentiment } from '../domain/entities/contact-summary.entity'
import { ChurnRiskPrediction, ChurnRiskTier } from '../domain/entities/churn-prediction.entity'

export class AiContactChurnDrizzleHelper {
  private static get db() { return getDb() }

  static async generateContactExecutiveSummary(tenantId: string, contactId: string): Promise<ContactExecutiveSummary> {
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
      : 'Presentar propuestas de expansión (Upsell) enfocadas en automatizaciones avanzadas de Nexora CRM.'

    return new ContactExecutiveSummary(contactId, fullName, summaryText, sentiment, painPoints, recStrategy, new Date())
  }

  static async predictChurnRisk(tenantId: string, contactId: string): Promise<ChurnRiskPrediction> {
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
