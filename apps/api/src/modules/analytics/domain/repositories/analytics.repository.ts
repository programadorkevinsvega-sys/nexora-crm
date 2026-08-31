import { RevenueMetrics } from '../entities/revenue-metrics.entity'
import { FunnelMetrics } from '../entities/funnel-metrics.entity'
import { CohortMetrics } from '../entities/cohort-metrics.entity'

export abstract class AnalyticsRepository {
  abstract getRevenueMetrics(tenantId: string): Promise<RevenueMetrics>
  abstract getFunnelMetrics(tenantId: string): Promise<FunnelMetrics>
  abstract getCohortMetrics(tenantId: string): Promise<CohortMetrics>
}
