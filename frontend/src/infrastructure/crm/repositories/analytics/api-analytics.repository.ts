import { api } from "../../api/api-client"
import type { RevenueMetrics, FunnelMetrics, CohortMetrics } from "@crm/contracts"

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
}
