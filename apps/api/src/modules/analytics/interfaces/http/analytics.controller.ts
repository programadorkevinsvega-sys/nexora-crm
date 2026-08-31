import { Controller, Get, Headers } from '@nestjs/common'
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

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly getRevenueHandler: GetRevenueMetricsHandler,
    private readonly getFunnelHandler: GetFunnelMetricsHandler,
    private readonly getCohortHandler: GetCohortMetricsHandler,
  ) {}

  @Get('revenue')
  async getRevenueMetrics(
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.getRevenueHandler.execute(new GetRevenueMetricsQuery(tenantId))
  }

  @Get('funnel')
  async getFunnelMetrics(
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.getFunnelHandler.execute(new GetFunnelMetricsQuery(tenantId))
  }

  @Get('cohorts')
  async getCohortMetrics(
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.getCohortHandler.execute(new GetCohortMetricsQuery(tenantId))
  }
}
