import { AnalyticsBffController } from './analytics.bff.controller'
import { AnalyticsBffService } from './analytics.bff.service'
import type { RevenueMetrics, FunnelMetrics, CohortMetrics } from '@crm/contracts'

describe('AnalyticsBffController', () => {
  let controller: AnalyticsBffController
  let mockService: jest.Mocked<AnalyticsBffService>

  beforeEach(() => {
    mockService = {
      getRevenueMetrics: jest.fn(),
      getFunnelMetrics: jest.fn(),
      getCohortMetrics: jest.fn(),
    } as any

    controller = new AnalyticsBffController(mockService)
  })

  it('should return revenue metrics from GET /api/analytics/revenue', async () => {
    const rev: RevenueMetrics = {
      totalArr: 60000,
      totalMrr: 5000,
      newMrr: 3500,
      expansionMrr: 1000,
      contractionMrr: 250,
      churnedMrr: 250,
      netNewMrr: 4000,
      ltv: 12000,
      cac: 2500,
      ltvCacRatio: 4.8,
      winRatePercent: 50,
      avgDealSize: 5000,
      avgSalesCycleDays: 12,
      salesVelocityPerDay: 208,
      currency: 'USD',
    }
    mockService.getRevenueMetrics.mockResolvedValue(rev)

    const res = await controller.getRevenueMetrics('tenant-1')

    expect(mockService.getRevenueMetrics).toHaveBeenCalledWith('tenant-1')
    expect(res.totalArr).toBe(60000)
  })

  it('should return funnel metrics from GET /api/analytics/funnel', async () => {
    const fnl: FunnelMetrics = {
      period: 'LAST_30_DAYS',
      stages: [],
      overallConversionRatePercent: 30,
    }
    mockService.getFunnelMetrics.mockResolvedValue(fnl)

    const res = await controller.getFunnelMetrics('tenant-1')

    expect(mockService.getFunnelMetrics).toHaveBeenCalledWith('tenant-1')
    expect(res.overallConversionRatePercent).toBe(30)
  })

  it('should return cohort metrics from GET /api/analytics/cohorts', async () => {
    const chs: CohortMetrics = {
      cohorts: [],
    }
    mockService.getCohortMetrics.mockResolvedValue(chs)

    const res = await controller.getCohortMetrics('tenant-1')

    expect(mockService.getCohortMetrics).toHaveBeenCalledWith('tenant-1')
    expect(res.cohorts).toEqual([])
  })
})
