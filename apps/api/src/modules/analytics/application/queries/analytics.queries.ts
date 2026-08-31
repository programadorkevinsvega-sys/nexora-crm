export class GetRevenueMetricsQuery {
  constructor(readonly tenantId: string) {}
}

export class GetFunnelMetricsQuery {
  constructor(readonly tenantId: string) {}
}

export class GetCohortMetricsQuery {
  constructor(readonly tenantId: string) {}
}

export class GetRevenueForecastQuery {
  constructor(
    readonly tenantId: string,
    readonly horizon: '3M' | '6M' = '3M',
  ) {}
}
