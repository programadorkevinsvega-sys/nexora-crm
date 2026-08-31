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
import { AnalyticsRepository } from '../../domain/repositories/analytics.repository'
import { RevenueMetrics } from '../../domain/entities/revenue-metrics.entity'
import { FunnelMetrics } from '../../domain/entities/funnel-metrics.entity'
import { CohortMetrics } from '../../domain/entities/cohort-metrics.entity'

describe('Analytics Handlers', () => {
  let repo: jest.Mocked<AnalyticsRepository>

  beforeEach(() => {
    repo = {
      getRevenueMetrics: jest.fn(),
      getFunnelMetrics: jest.fn(),
      getCohortMetrics: jest.fn(),
    }
  })

  it('GetRevenueMetricsHandler should return revenue metrics', async () => {
    const rev = new RevenueMetrics(
      120000,
      10000,
      7000,
      2000,
      500,
      500,
      8000,
      24000,
      5000,
      4.8,
      45,
      12000,
      14,
      385,
      'USD',
    )
    repo.getRevenueMetrics.mockResolvedValue(rev)

    const handler = new GetRevenueMetricsHandler(repo)
    const res = await handler.execute(new GetRevenueMetricsQuery('tenant-1'))

    expect(res.totalArr).toBe(120000)
    expect(res.totalMrr).toBe(10000)
    expect(res.ltvCacRatio).toBe(4.8)
    expect(repo.getRevenueMetrics).toHaveBeenCalledWith('tenant-1')
  })

  it('GetFunnelMetricsHandler should return funnel metrics', async () => {
    const fnl = new FunnelMetrics('LAST_30_DAYS', [], 25)
    repo.getFunnelMetrics.mockResolvedValue(fnl)

    const handler = new GetFunnelMetricsHandler(repo)
    const res = await handler.execute(new GetFunnelMetricsQuery('tenant-1'))

    expect(res.overallConversionRatePercent).toBe(25)
    expect(repo.getFunnelMetrics).toHaveBeenCalledWith('tenant-1')
  })

  it('GetCohortMetricsHandler should return cohort metrics', async () => {
    const chs = new CohortMetrics([])
    repo.getCohortMetrics.mockResolvedValue(chs)

    const handler = new GetCohortMetricsHandler(repo)
    const res = await handler.execute(new GetCohortMetricsQuery('tenant-1'))

    expect(res.cohorts).toEqual([])
    expect(repo.getCohortMetrics).toHaveBeenCalledWith('tenant-1')
  })
})
