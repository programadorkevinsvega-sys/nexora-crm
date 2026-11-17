export class AffiliateCommission {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly affiliateId: string,
    readonly sourceOrderId: string,
    readonly commissionAmount: number,
    readonly mlmLevelEarned: number | null,
    readonly status: string | null,
    readonly approvedAt: Date | null,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    affiliateId: string
    sourceOrderId: string
    commissionAmount: number
    mlmLevelEarned?: number
    status?: string
    approvedAt?: Date
  }): AffiliateCommission {
    return new AffiliateCommission(
      crypto.randomUUID(),
      props.tenantId,
      props.affiliateId,
      props.sourceOrderId,
      props.commissionAmount,
      props.mlmLevelEarned ?? null,
      props.status ?? null,
      props.approvedAt ?? null,
      new Date(),
    )
  }
}
