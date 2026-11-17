import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { getDb, customerHealthScores, contacts, notes, supportTickets, deals } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import { HealthScoreCalculatorHelper } from './health-score-calculator.helper'
import type { CustomerHealthScore } from '@crm/contracts'

@Injectable()
export class HealthScoreBffService {
  private readonly logger = new Logger(HealthScoreBffService.name)
  private get db() {
    return getDb()
  }

  async calculateContactHealthScore(tenantId: string, contactId: string): Promise<CustomerHealthScore> {
    const [contact] = await this.db
      .select()
      .from(contacts)
      .where(and(eq(contacts.tenantId, tenantId), eq(contacts.id, contactId)))
      .limit(1)

    if (!contact) {
      throw new NotFoundException(`Contacto no encontrado: ${contactId}`)
    }

    const contactNotes = await this.db
      .select()
      .from(notes)
      .where(and(eq(notes.tenantId, tenantId), eq(notes.contactId, contactId)))

    const openTickets = await this.db
      .select()
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.tenantId, tenantId),
          eq(supportTickets.contactId, contactId),
          eq(supportTickets.status, 'OPEN'),
        ),
      )

    const wonDeals = await this.db
      .select()
      .from(deals)
      .where(and(eq(deals.tenantId, tenantId), eq(deals.contactId, contactId)))

    const lastNoteDate = contactNotes[0]?.createdAt ? new Date(contactNotes[0].createdAt) : new Date(contact.createdAt)
    const daysSinceLastInteraction = Math.max(0, Math.floor((Date.now() - lastNoteDate.getTime()) / (1000 * 60 * 60 * 24)))

    const calc = HealthScoreCalculatorHelper.calculate({
      interactionCount: contactNotes.length,
      openTicketsCount: openTickets.length,
      hasActiveDealsOrContracts: wonDeals.length > 0,
      daysSinceLastInteraction,
    })

    const [existing] = await this.db
      .select()
      .from(customerHealthScores)
      .where(and(eq(customerHealthScores.tenantId, tenantId), eq(customerHealthScores.contactId, contactId)))
      .limit(1)

    let record: any
    if (existing) {
      const [updated] = await this.db
        .update(customerHealthScores)
        .set({
          healthScore: calc.healthScore,
          status: calc.status,
          engagementScore: calc.engagementScore,
          supportScore: calc.supportScore,
          financialScore: calc.financialScore,
          recencyScore: calc.recencyScore,
          churnProbability: String(calc.churnProbability),
          primaryRiskFactor: calc.primaryRiskFactor,
          recommendedAction: calc.recommendedAction,
          lastCalculatedAt: new Date(),
        })
        .where(eq(customerHealthScores.id, existing.id))
        .returning()
      record = updated
    } else {
      const [created] = await this.db
        .insert(customerHealthScores)
        .values({
          tenantId,
          contactId,
          healthScore: calc.healthScore,
          status: calc.status,
          engagementScore: calc.engagementScore,
          supportScore: calc.supportScore,
          financialScore: calc.financialScore,
          recencyScore: calc.recencyScore,
          churnProbability: String(calc.churnProbability),
          primaryRiskFactor: calc.primaryRiskFactor,
          recommendedAction: calc.recommendedAction,
        })
        .returning()
      record = created
    }

    this.logger.log(`Health score calculated for contact ${contactId}: ${calc.healthScore} (${calc.status})`)
    return this.mapScore(record)
  }

  async getContactHealthScore(tenantId: string, contactId: string): Promise<CustomerHealthScore> {
    const [score] = await this.db
      .select()
      .from(customerHealthScores)
      .where(and(eq(customerHealthScores.tenantId, tenantId), eq(customerHealthScores.contactId, contactId)))
      .limit(1)

    if (score) {
      return this.mapScore(score)
    }
    return this.calculateContactHealthScore(tenantId, contactId)
  }

  async listAtRiskCustomers(tenantId: string): Promise<CustomerHealthScore[]> {
    const rows = await this.db
      .select()
      .from(customerHealthScores)
      .where(and(eq(customerHealthScores.tenantId, tenantId)))
      .orderBy(customerHealthScores.healthScore)

    return rows.map((r) => this.mapScore(r))
  }

  private mapScore(r: any): CustomerHealthScore {
    return {
      ...r,
      churnProbability: Number(r.churnProbability),
      contactId: r.contactId ?? undefined,
      companyId: r.companyId ?? undefined,
      primaryRiskFactor: r.primaryRiskFactor ?? undefined,
      recommendedAction: r.recommendedAction ?? undefined,
      lastCalculatedAt: r.lastCalculatedAt ? new Date(r.lastCalculatedAt).toISOString() : new Date().toISOString(),
    }
  }
}
