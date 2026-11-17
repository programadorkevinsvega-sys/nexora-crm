import { Injectable } from '@nestjs/common'
import { eq, and, gte } from 'drizzle-orm'
import { getDb, deals } from '@crm/database'
import { RevenueForecast, ForecastDataPoint } from '../domain/entities/revenue-forecast.entity'

@Injectable()
export class DrizzleForecastRepository {
  private get db() {
    return getDb()
  }

  async getRevenueForecast(tenantId: string): Promise<RevenueForecast> {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [allDeals, wonDeals] = await Promise.all([
      this.db.select().from(deals).where(eq(deals.tenantId, tenantId)),
      this.db
        .select()
        .from(deals)
        .where(and(eq(deals.tenantId, tenantId), eq(deals.status, 'WON'), gte(deals.updatedAt, sixMonthsAgo))),
    ])

    const monthlyMrr = new Map<string, number>()
    let totalCycleDays = 0
    let wonCount = 0
    let lostCount = 0

    for (const d of wonDeals) {
      const month = d.updatedAt.toISOString().substring(0, 7)
      const amt = Number(d.amount) || 0
      monthlyMrr.set(month, (monthlyMrr.get(month) ?? 0) + Math.round(amt / 12))
      const diffMs = d.updatedAt.getTime() - d.createdAt.getTime()
      totalCycleDays += Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)))
      wonCount++
    }

    for (const d of allDeals) {
      if (d.status === 'LOST') lostCount++
    }

    const mrrValues = Array.from(monthlyMrr.values())
    const avgMrr = mrrValues.length > 0 ? mrrValues.reduce((a, b) => a + b, 0) / mrrValues.length : 0
    const avgSalesCycleDays = wonCount > 0 ? Math.round(totalCycleDays / wonCount) : 30
    const totalClosed = wonCount + lostCount
    const winRate = totalClosed > 0 ? wonCount / totalClosed : 0

    const pipelineValue = allDeals
      .filter((d) => d.status === 'OPEN')
      .reduce((s, d) => s + (Number(d.amount) || 0), 0)
    const pipelineVelocity = avgSalesCycleDays > 0 ? Math.round(pipelineValue / avgSalesCycleDays) : 0

    const dataPoints: ForecastDataPoint[] = []
    const now = new Date()
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const month = d.toISOString().substring(0, 7)
      const growthRate = 0.03 * i
      const forecasted = Math.round(avgMrr * (1 + growthRate))
      dataPoints.push({
        month,
        forecastedRevenue: forecasted,
        pessimisticRevenue: Math.round(forecasted * 0.7),
        optimisticRevenue: Math.round(forecasted * 1.3),
        pipelineValue: Math.round(pipelineValue * winRate),
        confidence: Math.max(40, 90 - i * 8),
      })
    }

    const totalForecast3M = dataPoints.slice(0, 3).reduce((s, p) => s + p.forecastedRevenue, 0)
    const totalForecast6M = dataPoints.reduce((s, p) => s + p.forecastedRevenue, 0)

    return new RevenueForecast(
      '6M',
      Math.round(avgMrr),
      dataPoints,
      totalForecast3M,
      totalForecast6M,
      avgSalesCycleDays,
      pipelineVelocity,
      Math.round(winRate * 100),
      'USD',
    )
  }
}
