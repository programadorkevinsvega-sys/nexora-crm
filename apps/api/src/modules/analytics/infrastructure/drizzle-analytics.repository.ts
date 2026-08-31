import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import {
  getDb,
  deals,
  contacts,
  calls,
  whatsappMessages,
  emails,
  quotes,
  campaigns,
} from '@crm/database'
import { AnalyticsRepository } from '../domain/repositories/analytics.repository'
import { RevenueMetrics } from '../domain/entities/revenue-metrics.entity'
import { FunnelMetrics } from '../domain/entities/funnel-metrics.entity'
import { CohortMetrics } from '../domain/entities/cohort-metrics.entity'
import { FunnelStage, CohortRow } from '@crm/contracts'

@Injectable()
export class DrizzleAnalyticsRepository extends AnalyticsRepository {
  private get db() {
    return getDb()
  }

  async getRevenueMetrics(tenantId: string): Promise<RevenueMetrics> {
    const [dealsList, campaignsList] = await Promise.all([
      this.db.select().from(deals).where(eq(deals.tenantId, tenantId)),
      this.db.select().from(campaigns).where(eq(campaigns.tenantId, tenantId)),
    ])

    let wonAmount = 0
    let wonCount = 0
    let lostCount = 0
    let totalCycleDays = 0

    for (const d of dealsList) {
      const amt = Number(d.amount) || 0
      if (d.status === 'WON') {
        wonAmount += amt
        wonCount++
        const diffMs = d.updatedAt.getTime() - d.createdAt.getTime()
        const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)))
        totalCycleDays += days
      } else if (d.status === 'LOST') {
        lostCount++
      }
    }

    const totalClosed = wonCount + lostCount
    const winRatePercent = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0
    const avgDealSize = wonCount > 0 ? Math.round(wonAmount / wonCount) : 0
    const avgSalesCycleDays = wonCount > 0 ? Math.round(totalCycleDays / wonCount) : 0

    const velocityPerDay =
      avgSalesCycleDays > 0
        ? Math.round((dealsList.length * (winRatePercent / 100) * avgDealSize) / avgSalesCycleDays)
        : 0

    const totalMrr = Math.round(wonAmount > 0 ? wonAmount / 12 : 0)
    const totalArr = totalMrr * 12
    const newMrr = totalMrr
    const expansionMrr = 0
    const contractionMrr = 0
    const churnedMrr = 0
    const netNewMrr = newMrr

    let totalCampaignCost = 0
    for (const c of campaignsList) {
      totalCampaignCost += Number(c.budgetedCost || c.actualCost) || 0
    }
    const cac = wonCount > 0 && totalCampaignCost > 0 ? Math.round(totalCampaignCost / wonCount) : 0
    const ltv = avgDealSize > 0 ? avgDealSize : 0
    const ltvCacRatio = cac > 0 ? Number((ltv / cac).toFixed(1)) : 0

    return new RevenueMetrics(
      totalArr,
      totalMrr,
      newMrr,
      expansionMrr,
      contractionMrr,
      churnedMrr,
      netNewMrr,
      ltv,
      cac,
      ltvCacRatio,
      winRatePercent,
      avgDealSize,
      avgSalesCycleDays,
      velocityPerDay,
      'USD',
    )
  }

  async getFunnelMetrics(tenantId: string): Promise<FunnelMetrics> {
    const [contactsList, callsList, waList, emailsList, dealsList, quotesList] = await Promise.all([
      this.db.select().from(contacts).where(eq(contacts.tenantId, tenantId)),
      this.db.select().from(calls).where(eq(calls.tenantId, tenantId)),
      this.db.select().from(whatsappMessages).where(eq(whatsappMessages.tenantId, tenantId)),
      this.db.select().from(emails).where(eq(emails.tenantId, tenantId)),
      this.db.select().from(deals).where(eq(deals.tenantId, tenantId)),
      this.db.select().from(quotes).where(eq(quotes.tenantId, tenantId)),
    ])

    const contactedContactIds = new Set<string>()
    for (const c of callsList) if (c.contactId) contactedContactIds.add(c.contactId)
    for (const w of waList) if (w.contactId) contactedContactIds.add(w.contactId)
    for (const e of emailsList) if (e.contactId) contactedContactIds.add(e.contactId)

    const totalLeads = contactsList.length
    const contactedLeads = contactedContactIds.size
    const totalDeals = dealsList.length
    let dealsValue = 0
    let wonCount = 0
    let wonValue = 0
    for (const d of dealsList) {
      const amt = Number(d.amount) || 0
      dealsValue += amt
      if (d.status === 'WON') {
        wonCount++
        wonValue += amt
      }
    }

    const totalQuotes = quotesList.length
    let quotesValue = 0
    for (const q of quotesList) {
      quotesValue += Number(q.grandTotal) || 0
    }

    const rawStages = [
      { name: '1. Leads Registrados', count: totalLeads, val: 0 },
      { name: '2. Leads Contactados (Interacción)', count: contactedLeads, val: 0 },
      { name: '3. Oportunidades Creadas (Deals)', count: totalDeals, val: dealsValue },
      { name: '4. Cotizaciones Enviadas (CPQ)', count: totalQuotes, val: quotesValue },
      { name: '5. Clientes Ganados (Venta Cerrada)', count: wonCount, val: wonValue },
    ]

    const stages: FunnelStage[] = []
    for (let i = 0; i < rawStages.length; i++) {
      const curr = rawStages[i]
      let convRate = 0
      let dropRate = 0

      if (i === 0) {
        convRate = curr.count > 0 ? 100 : 0
        dropRate = 0
      } else {
        const prev = rawStages[i - 1]
        convRate = prev.count > 0 ? Math.min(100, Math.round((curr.count / prev.count) * 100)) : 0
        dropRate = prev.count > 0 ? Math.max(0, 100 - convRate) : 0
      }

      stages.push({
        stageIndex: i + 1,
        stageName: curr.name,
        count: curr.count,
        totalValue: curr.val,
        conversionRatePercent: convRate,
        dropOffRatePercent: dropRate,
      })
    }

    const overallConversion =
      totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0

    return new FunnelMetrics('LAST_30_DAYS', stages, overallConversion)
  }

  async getCohortMetrics(tenantId: string): Promise<CohortMetrics> {
    const dealsList = await this.db
      .select()
      .from(deals)
      .where(and(eq(deals.tenantId, tenantId), eq(deals.status, 'WON')))

    const monthlyBuckets = new Map<string, { count: number; mrr: number }>()
    for (const d of dealsList) {
      const month = d.createdAt.toISOString().substring(0, 7)
      const amt = Number(d.amount) || 0
      if (!monthlyBuckets.has(month)) {
        monthlyBuckets.set(month, { count: 0, mrr: 0 })
      }
      const b = monthlyBuckets.get(month)!
      b.count++
      b.mrr += Math.round(amt / 12)
    }

    const cohorts: CohortRow[] = []
    const sortedMonths = Array.from(monthlyBuckets.keys()).sort()

    for (const m of sortedMonths) {
      const b = monthlyBuckets.get(m)!
      cohorts.push({
        cohortMonth: m,
        totalCustomers: b.count,
        initialMrr: b.mrr,
        retentionRates: [100, 100, 100, 100, 100, 100, 100],
        nrrRates: [100, 100, 100, 100, 100, 100, 100],
      })
    }

    return new CohortMetrics(cohorts)
  }
}
