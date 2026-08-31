import { Controller, Get, Headers, Query } from '@nestjs/common'
import { AnalyticsBffService } from './analytics.bff.service'
import type { RevenueMetrics, FunnelMetrics, CohortMetrics, RevenueForecast } from '@crm/contracts'

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001'

@Controller('api/analytics')
export class AnalyticsBffController {
  constructor(private readonly service: AnalyticsBffService) {}

  @Get('revenue')
  async getRevenueMetrics(@Headers('X-Tenant-Id') t?: string): Promise<RevenueMetrics> {
    return this.service.getRevenueMetrics(t || DEFAULT_TENANT)
  }

  @Get('funnel')
  async getFunnelMetrics(@Headers('X-Tenant-Id') t?: string): Promise<FunnelMetrics> {
    return this.service.getFunnelMetrics(t || DEFAULT_TENANT)
  }

  @Get('cohorts')
  async getCohortMetrics(@Headers('X-Tenant-Id') t?: string): Promise<CohortMetrics> {
    return this.service.getCohortMetrics(t || DEFAULT_TENANT)
  }

  @Get('forecast')
  async getForecast(
    @Headers('X-Tenant-Id') t?: string,
    @Query('horizon') horizon?: string,
  ): Promise<RevenueForecast> {
    const h = horizon === '6M' ? '6M' : '3M'
    return this.service.getForecast(t || DEFAULT_TENANT, h)
  }
}
