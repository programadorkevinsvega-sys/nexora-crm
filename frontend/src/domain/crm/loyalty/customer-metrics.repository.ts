export interface CustomerMetricsData {
  id: string
  tenantId: string
  contactId: string
  churnRiskScore: number | null
  rfmScore: number | null
  npsScore: number | null
  customerSatisfactionScore: number | null
  calculatedAt: string
}

export interface CustomerMetricsRepository {
  getByContactId(contactId: string): Promise<CustomerMetricsData | null>
}
