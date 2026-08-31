import { Injectable } from '@nestjs/common'
import {
  GetRevenueMetricsQuery,
  GetFunnelMetricsQuery,
  GetCohortMetricsQuery,
} from './analytics.queries'
import { AnalyticsRepository } from '../../domain/repositories/analytics.repository'
import { RevenueMetrics } from '../../domain/entities/revenue-metrics.entity'
import { FunnelMetrics } from '../../domain/entities/funnel-metrics.entity'
import { CohortMetrics } from '../../domain/entities/cohort-metrics.entity'

@Injectable()
export class GetRevenueMetricsHandler {
  constructor(private readonly repo: AnalyticsRepository) {}

  async execute(query: GetRevenueMetricsQuery): Promise<RevenueMetrics> {
    return this.repo.getRevenueMetrics(query.tenantId)
  }
}

@Injectable()
export class GetFunnelMetricsHandler {
  constructor(private readonly repo: AnalyticsRepository) {}

  async execute(query: GetFunnelMetricsQuery): Promise<FunnelMetrics> {
    return this.repo.getFunnelMetrics(query.tenantId)
  }
}

@Injectable()
export class GetCohortMetricsHandler {
  constructor(private readonly repo: AnalyticsRepository) {}

  async execute(query: GetCohortMetricsQuery): Promise<CohortMetrics> {
    return this.repo.getCohortMetrics(query.tenantId)
  }
}
