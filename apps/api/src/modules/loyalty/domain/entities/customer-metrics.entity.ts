export class CustomerMetrics {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string,
    readonly churnRiskScore: number | null,
    readonly rfmScore: string | null,
    readonly npsScore: number | null,
    readonly customerSatisfactionScore: number | null,
    readonly calculatedAt: Date | null,
  ) {}

  static create(props: {
    tenantId: string
    contactId: string
    churnRiskScore?: number
    rfmScore?: string
    npsScore?: number
    customerSatisfactionScore?: number
    calculatedAt?: Date
  }): CustomerMetrics {
    return new CustomerMetrics(
      crypto.randomUUID(),
      props.tenantId,
      props.contactId,
      props.churnRiskScore ?? null,
      props.rfmScore ?? null,
      props.npsScore ?? null,
      props.customerSatisfactionScore ?? null,
      props.calculatedAt ?? new Date(),
    )
  }
}
