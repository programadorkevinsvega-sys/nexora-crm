import { api } from "../../api/api-client"
import type { RevenueMetrics, FunnelMetrics, CohortMetrics, RevenueForecast } from "@crm/contracts"

export const ApiAnalyticsRepository = {
  async getRevenueMetrics(): Promise<RevenueMetrics> {
    return api.get<RevenueMetrics>("/api/analytics/revenue")
  },

  async getFunnelMetrics(): Promise<FunnelMetrics> {
    return api.get<FunnelMetrics>("/api/analytics/funnel")
  },

  async getCohortMetrics(): Promise<CohortMetrics> {
    return api.get<CohortMetrics>("/api/analytics/cohorts")
  },

  async getForecast(horizon: '3M' | '6M' = '3M'): Promise<RevenueForecast> {
    return api.get<RevenueForecast>(`/api/analytics/forecast?horizon=${horizon}`)
  },
}
