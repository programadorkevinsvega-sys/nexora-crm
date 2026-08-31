export class Affiliate {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly programId: string,
    readonly customerId: string,
    readonly referralCode: string,
    readonly referralLink: string,
    readonly parentAffiliateId: string | null,
    readonly mlmLevel: number | null,
    readonly status: string | null,
    readonly totalEarnings: number | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    programId: string
    customerId: string
    referralCode: string
    referralLink: string
    parentAffiliateId?: string
    mlmLevel?: number
    status?: string
    totalEarnings?: number
  }): Affiliate {
    return new Affiliate(
      crypto.randomUUID(),
      props.tenantId,
      props.programId,
      props.customerId,
      props.referralCode,
      props.referralLink,
      props.parentAffiliateId ?? null,
      props.mlmLevel ?? null,
      props.status ?? null,
      props.totalEarnings ?? null,
      new Date(),
      new Date(),
    )
  }
}
