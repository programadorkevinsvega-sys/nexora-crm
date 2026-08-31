import { z } from 'zod'

export const RevenueMetricsSchema = z.object({
  totalArr: z.number().default(0),
  totalMrr: z.number().default(0),
  newMrr: z.number().default(0),
  expansionMrr: z.number().default(0),
  contractionMrr: z.number().default(0),
  churnedMrr: z.number().default(0),
  netNewMrr: z.number().default(0),
  ltv: z.number().default(0),
  cac: z.number().default(0),
  ltvCacRatio: z.number().default(0),
  winRatePercent: z.number().default(0),
  avgDealSize: z.number().default(0),
  avgSalesCycleDays: z.number().default(0),
  salesVelocityPerDay: z.number().default(0),
  currency: z.string().default('USD'),
})
export type RevenueMetrics = z.infer<typeof RevenueMetricsSchema>

export const FunnelStageSchema = z.object({
  stageIndex: z.number().int(),
  stageName: z.string(),
  count: z.number().int(),
  totalValue: z.number().default(0),
  conversionRatePercent: z.number().default(0),
  dropOffRatePercent: z.number().default(0),
})
export type FunnelStage = z.infer<typeof FunnelStageSchema>

export const FunnelMetricsSchema = z.object({
  period: z.string().default('LAST_30_DAYS'),
  stages: z.array(FunnelStageSchema).default([]),
  overallConversionRatePercent: z.number().default(0),
})
export type FunnelMetrics = z.infer<typeof FunnelMetricsSchema>

export const CohortRowSchema = z.object({
  cohortMonth: z.string(),
  totalCustomers: z.number().int(),
  initialMrr: z.number(),
  retentionRates: z.array(z.number()),
  nrrRates: z.array(z.number()),
})
export type CohortRow = z.infer<typeof CohortRowSchema>

export const CohortMetricsSchema = z.object({
  cohorts: z.array(CohortRowSchema).default([]),
})
export type CohortMetrics = z.infer<typeof CohortMetricsSchema>

export const ForecastDataPointSchema = z.object({
  month: z.string(),
  forecastedRevenue: z.number().default(0),
  pessimisticRevenue: z.number().default(0),
  optimisticRevenue: z.number().default(0),
  pipelineValue: z.number().default(0),
  confidence: z.number().min(0).max(100).default(75),
})
export type ForecastDataPoint = z.infer<typeof ForecastDataPointSchema>

export const RevenueForecastSchema = z.object({
  horizon: z.enum(['3M', '6M']).default('3M'),
  baseRevenue: z.number().default(0),
  dataPoints: z.array(ForecastDataPointSchema).default([]),
  totalForecast3M: z.number().default(0),
  totalForecast6M: z.number().default(0),
  avgSalesCycleDays: z.number().default(0),
  pipelineVelocity: z.number().default(0),
  winRate: z.number().default(0),
  currency: z.string().default('USD'),
})
export type RevenueForecast = z.infer<typeof RevenueForecastSchema>
