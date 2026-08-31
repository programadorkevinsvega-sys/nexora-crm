import { Controller, Get, Headers } from '@nestjs/common'
import { AnalyticsBffService } from './analytics.bff.service'
import type { RevenueMetrics, FunnelMetrics, CohortMetrics } from '@crm/contracts'

@Controller('api/analytics')
export class AnalyticsBffController {
  constructor(private readonly service: AnalyticsBffService) {}

  @Get('revenue')
  async getRevenueMetrics(@Headers('X-Tenant-Id') tenantId?: string): Promise<RevenueMetrics> {
    return this.service.getRevenueMetrics(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('funnel')
  async getFunnelMetrics(@Headers('X-Tenant-Id') tenantId?: string): Promise<FunnelMetrics> {
    return this.service.getFunnelMetrics(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('cohorts')
  async getCohortMetrics(@Headers('X-Tenant-Id') tenantId?: string): Promise<CohortMetrics> {
    return this.service.getCohortMetrics(tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
