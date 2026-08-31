export interface ForecastDataPoint {
  month: string // 'YYYY-MM'
  forecastedRevenue: number
  pessimisticRevenue: number
  optimisticRevenue: number
  pipelineValue: number
  confidence: number // 0-100
}

export class RevenueForecast {
  constructor(
    readonly horizon: '3M' | '6M',
    readonly baseRevenue: number,
    readonly dataPoints: ForecastDataPoint[],
    readonly totalForecast3M: number,
    readonly totalForecast6M: number,
    readonly avgSalesCycleDays: number,
    readonly pipelineVelocity: number,
    readonly winRate: number,
    readonly currency: string,
  ) {}
}
