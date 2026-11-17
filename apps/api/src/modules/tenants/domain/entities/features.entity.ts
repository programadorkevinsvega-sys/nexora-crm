export class TenantFeature {
  constructor(
    readonly tenantId: string,
    readonly featureCode: string,
    readonly isEnabled: boolean,
    readonly enabledAt: Date,
  ) {}
}

export class TenantDomain {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly domain: string,
    readonly sslStatus: string,
    readonly isPrimary: boolean,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    domain: string
    isPrimary?: boolean
  }): TenantDomain {
    return new TenantDomain(
      crypto.randomUUID(),
      props.tenantId,
      props.domain,
      'PENDING',
      props.isPrimary ?? false,
      new Date(),
    )
  }
}

export class UsageMetric {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly metricName: string,
    readonly currentValue: number,
    readonly limitValue: number | null,
    readonly periodStart: Date,
    readonly periodEnd: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    metricName: string
    currentValue: number
    limitValue?: number
    periodStart: Date
    periodEnd: Date
  }): UsageMetric {
    return new UsageMetric(
      crypto.randomUUID(),
      props.tenantId,
      props.metricName,
      props.currentValue,
      props.limitValue ?? null,
      props.periodStart,
      props.periodEnd,
      new Date(),
    )
  }
}
