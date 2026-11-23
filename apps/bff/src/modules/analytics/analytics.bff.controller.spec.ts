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
    } as unknown as jest.Mocked<AnalyticsBffService>
    controller = new AnalyticsBffController(mockService)
  })

  it('returns revenue metrics', async () => {
    const revenue: RevenueMetrics = {
      totalArr: 60000, totalMrr: 5000, newMrr: 3500, expansionMrr: 1000,
      contractionMrr: 250, churnedMrr: 250, netNewMrr: 4000, ltv: 12000,
      cac: 2500, ltvCacRatio: 4.8, winRatePercent: 50, avgDealSize: 5000,
      avgSalesCycleDays: 12, salesVelocityPerDay: 208, currency: 'USD',
    }
    mockService.getRevenueMetrics.mockResolvedValue(revenue)
    const result = await controller.getRevenueMetrics('tenant-1')
    expect(mockService.getRevenueMetrics).toHaveBeenCalledWith('tenant-1')
    expect(result.totalArr).toBe(60000)
  })

  it('returns funnel metrics', async () => {
    const funnel: FunnelMetrics = { period: 'LAST_30_DAYS', stages: [], overallConversionRatePercent: 30 }
    mockService.getFunnelMetrics.mockResolvedValue(funnel)
    const result = await controller.getFunnelMetrics('tenant-1')
    expect(mockService.getFunnelMetrics).toHaveBeenCalledWith('tenant-1')
    expect(result.overallConversionRatePercent).toBe(30)
  })

  it('returns cohort metrics', async () => {
    const cohorts: CohortMetrics = { cohorts: [] }
    mockService.getCohortMetrics.mockResolvedValue(cohorts)
    const result = await controller.getCohortMetrics('tenant-1')
    expect(mockService.getCohortMetrics).toHaveBeenCalledWith('tenant-1')
    expect(result.cohorts).toEqual([])
  })
})