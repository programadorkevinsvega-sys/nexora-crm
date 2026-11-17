import { Injectable } from '@nestjs/common'
import { eq, and, desc } from 'drizzle-orm'
import {
  getDb,
  contacts,
  companies,
  deals,
  notes,
  tasks,
  calls,
  emails,
  whatsappMessages,
  supportTickets,
  leadScores,
  loyaltyProfiles,
} from '@crm/database'
import { Customer360Repository } from '../domain/repositories/customer-360.repository'
import { Customer360 } from '../domain/entities/customer-360.entity'
import { CustomerTimelineItem, Customer360Metrics } from '@crm/contracts'

@Injectable()
export class DrizzleCustomer360Repository extends Customer360Repository {
  private get db() {
    return getDb()
  }

  async getProfile(tenantId: string, contactId: string): Promise<Customer360 | null> {
    const contactRows = await this.db
      .select()
      .from(contacts)
      .where(and(eq(contacts.tenantId, tenantId), eq(contacts.id, contactId)))
      .limit(1)

    if (contactRows.length === 0) return null
    const contact = contactRows[0]

    let companyName: string | null = null
    if (contact.companyId) {
      const compRows = await this.db
        .select()
        .from(companies)
        .where(and(eq(companies.tenantId, tenantId), eq(companies.id, contact.companyId)))
        .limit(1)
      if (compRows.length > 0) companyName = compRows[0].name
    }

    const [dealsList, notesList, tasksList, callsList, emailsList, waList, ticketsList, scoreRows, loyaltyRows] =
      await Promise.all([
        this.db.select().from(deals).where(and(eq(deals.tenantId, tenantId), eq(deals.contactId, contactId))),
        this.db.select().from(notes).where(and(eq(notes.tenantId, tenantId), eq(notes.contactId, contactId))),
        this.db.select().from(tasks).where(and(eq(tasks.tenantId, tenantId), eq(tasks.contactId, contactId))),
        this.db.select().from(calls).where(and(eq(calls.tenantId, tenantId), eq(calls.contactId, contactId))),
        this.db.select().from(emails).where(and(eq(emails.tenantId, tenantId), eq(emails.contactId, contactId))),
        this.db.select().from(whatsappMessages).where(and(eq(whatsappMessages.tenantId, tenantId), eq(whatsappMessages.contactId, contactId))),
        this.db.select().from(supportTickets).where(and(eq(supportTickets.tenantId, tenantId), eq(supportTickets.contactId, contactId))),
        this.db.select().from(leadScores).where(and(eq(leadScores.tenantId, tenantId), eq(leadScores.contactId, contactId))).limit(1),
        this.db.select().from(loyaltyProfiles).where(and(eq(loyaltyProfiles.tenantId, tenantId), eq(loyaltyProfiles.contactId, contactId))).limit(1),
      ])

    let ltv = 0
    let activePipelineValue = 0
    for (const d of dealsList) {
      const amount = Number(d.amount) || 0
      if (d.status === 'WON') {
        ltv += amount
      } else if (d.status !== 'LOST') {
        activePipelineValue += amount
      }
    }

    const openTicketsCount = ticketsList.filter((t: any) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length
    const scoreVal = scoreRows.length > 0 ? scoreRows[0].score : 0
    const tempVal = (scoreRows.length > 0 ? scoreRows[0].temperature : 'COLD') as 'COLD' | 'WARM' | 'HOT'
    const loyaltyVal = loyaltyRows.length > 0 ? Number(loyaltyRows[0].loyaltyPointsBalance ?? 0) : 0

    const metrics: Customer360Metrics = {
      ltv,
      mrr: Math.round(ltv > 0 ? ltv / 12 : 0),
      activePipelineValue,
      loyaltyPoints: loyaltyVal,
      leadScore: scoreVal,
      leadTemperature: tempVal,
      openTicketsCount,
      activeContractsCount: 0,
      totalDealsCount: dealsList.length,
    }

    const timeline: CustomerTimelineItem[] = []

    for (const n of notesList) {
      timeline.push({
        id: n.id,
        type: 'NOTE',
        title: 'Nota de Seguimiento',
        description: n.content,
        timestamp: n.createdAt.toISOString(),
      })
    }
    for (const t of tasksList) {
      timeline.push({
        id: t.id,
        type: 'TASK',
        title: `Tarea: ${t.title}`,
        description: t.description,
        timestamp: t.createdAt.toISOString(),
        status: t.isCompleted ? 'COMPLETED' : 'PENDING',
      })
    }
    for (const c of callsList) {
      timeline.push({
        id: c.id,
        type: 'CALL',
        title: `Llamada (${c.callType ?? 'OUTBOUND'})`,
        description: c.summary,
        timestamp: (c.happenedAt || c.createdAt).toISOString(),
        status: 'LOGGED',
      })
    }
    for (const e of emailsList) {
      timeline.push({
        id: e.id,
        type: 'EMAIL',
        title: e.subject || 'Correo Electrónico',
        description: e.bodyText || e.bodyHtml,
        timestamp: (e.sentAt || new Date()).toISOString(),
        status: e.status,
      })
    }
    for (const w of waList) {
      timeline.push({
        id: w.id,
        type: 'WHATSAPP',
        title: `WhatsApp (${w.direction ?? 'Saliente'})`,
        description: w.messageBody,
        timestamp: (w.sentAt || new Date()).toISOString(),
        status: w.status,
      })
    }
    for (const d of dealsList) {
      timeline.push({
        id: d.id,
        type: 'DEAL',
        title: `Negocio / Oportunidad: ${d.name}`,
        description: `Monto: $${Number(d.amount).toLocaleString()} USD (Estado: ${d.status})`,
        timestamp: d.createdAt.toISOString(),
        status: d.status,
      })
    }
    for (const tk of ticketsList) {
      timeline.push({
        id: tk.id,
        type: 'TICKET',
        title: `Ticket de Soporte: ${tk.subject}`,
        description: tk.description,
        timestamp: tk.createdAt.toISOString(),
        status: tk.status,
      })
    }

    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return new Customer360(
      contact.id,
      contact.tenantId,
      contact.firstName,
      contact.lastName,
      contact.email,
      contact.phone,
      contact.jobTitle,
      companyName,
      contact.companyId,
      metrics,
      timeline,
    )
  }
}
