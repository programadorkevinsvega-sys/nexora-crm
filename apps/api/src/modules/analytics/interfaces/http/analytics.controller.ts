import { Controller, Get, Headers, Query } from '@nestjs/common'
import {
  GetRevenueMetricsHandler,
  GetFunnelMetricsHandler,
  GetCohortMetricsHandler,
  GetRevenueForecastHandler,
} from '../../application/queries/analytics.handlers'
import {
  GetRevenueMetricsQuery,
  GetFunnelMetricsQuery,
  GetCohortMetricsQuery,
  GetRevenueForecastQuery,
} from '../../application/queries/analytics.queries'

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly getRevenueHandler: GetRevenueMetricsHandler,
    private readonly getFunnelHandler: GetFunnelMetricsHandler,
    private readonly getCohortHandler: GetCohortMetricsHandler,
    private readonly getForecastHandler: GetRevenueForecastHandler,
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

  @Get('forecast')
  async getForecast(
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
    @Query('horizon') horizon: '3M' | '6M' = '3M',
  ) {
    return this.getForecastHandler.execute(new GetRevenueForecastQuery(tenantId, horizon))
  }
}
