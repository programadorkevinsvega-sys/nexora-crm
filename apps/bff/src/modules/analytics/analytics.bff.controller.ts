import { Controller, Get, Headers, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { AnalyticsBffService } from './analytics.bff.service'
import type { RevenueMetrics, FunnelMetrics, CohortMetrics, RevenueForecast } from '@crm/contracts'

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001'

@ApiTags('Analítica & Forecasting (Analytics)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/analytics')
export class AnalyticsBffController {
  constructor(private readonly service: AnalyticsBffService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Métricas de ingresos (MRR, ARR, LTV, CAC)' })
  async getRevenueMetrics(@Headers('X-Tenant-Id') t?: string): Promise<RevenueMetrics> {
    return this.service.getRevenueMetrics(t || DEFAULT_TENANT)
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Métricas del embudo de conversión comercial' })
  async getFunnelMetrics(@Headers('X-Tenant-Id') t?: string): Promise<FunnelMetrics> {
    return this.service.getFunnelMetrics(t || DEFAULT_TENANT)
  }

  @Get('cohorts')
  @ApiOperation({ summary: 'Análisis de retención por cohortes mensuales' })
  async getCohortMetrics(@Headers('X-Tenant-Id') t?: string): Promise<CohortMetrics> {
    return this.service.getCohortMetrics(t || DEFAULT_TENANT)
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Proyección matemática automatizada de ingresos futuros (3M o 6M)' })
  @ApiQuery({ name: 'horizon', required: false, description: 'Horizonte de proyección: 3M o 6M' })
  async getForecast(
    @Headers('X-Tenant-Id') t?: string,
    @Query('horizon') horizon?: string,
  ): Promise<RevenueForecast> {
    const h = horizon === '6M' ? '6M' : '3M'
    return this.service.getForecast(t || DEFAULT_TENANT, h)
  }
}
