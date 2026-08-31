import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  GetRevenueMetricsHandler,
  GetFunnelMetricsHandler,
  GetCohortMetricsHandler,
} from '../../application/queries/analytics.handlers'
import {
  GetRevenueMetricsQuery,
  GetFunnelMetricsQuery,
  GetCohortMetricsQuery,
} from '../../application/queries/analytics.queries'

@Controller()
export class AnalyticsGrpcController {
  constructor(
    private readonly getRevenueHandler: GetRevenueMetricsHandler,
    private readonly getFunnelHandler: GetFunnelMetricsHandler,
    private readonly getCohortHandler: GetCohortMetricsHandler,
  ) {}

  @GrpcMethod('AnalyticsService', 'GetRevenueMetrics')
  async getRevenueMetrics(data: { tenantId: string }) {
    const metrics = await this.getRevenueHandler.execute(
      new GetRevenueMetricsQuery(data.tenantId),
    )
    return { json: JSON.stringify(metrics) }
  }

  @GrpcMethod('AnalyticsService', 'GetFunnelMetrics')
  async getFunnelMetrics(data: { tenantId: string }) {
    const funnel = await this.getFunnelHandler.execute(
      new GetFunnelMetricsQuery(data.tenantId),
    )
    return { json: JSON.stringify(funnel) }
  }

  @GrpcMethod('AnalyticsService', 'GetCohortMetrics')
  async getCohortMetrics(data: { tenantId: string }) {
    const cohorts = await this.getCohortHandler.execute(
      new GetCohortMetricsQuery(data.tenantId),
    )
    return { json: JSON.stringify(cohorts) }
  }
}
