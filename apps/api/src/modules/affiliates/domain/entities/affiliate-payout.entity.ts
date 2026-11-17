export class AffiliatePayout {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly affiliateId: string,
    readonly amount: number,
    readonly paymentMethod: string | null,
    readonly paymentReference: string | null,
    readonly status: string | null,
    readonly paidAt: Date | null,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    affiliateId: string
    amount: number
    paymentMethod?: string
    paymentReference?: string
    status?: string
    paidAt?: Date
  }): AffiliatePayout {
    return new AffiliatePayout(
      crypto.randomUUID(),
      props.tenantId,
      props.affiliateId,
      props.amount,
      props.paymentMethod ?? null,
      props.paymentReference ?? null,
      props.status ?? null,
      props.paidAt ?? null,
      new Date(),
    )
  }
}
