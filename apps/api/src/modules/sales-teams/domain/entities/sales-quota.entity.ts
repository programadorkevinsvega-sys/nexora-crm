export class SalesQuota {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly userId: string,
    readonly teamId: string | null,
    readonly periodMonth: number,
    readonly periodYear: number,
    readonly targetAmount: number,
    readonly achievedAmount: number,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    userId: string
    teamId?: string
    periodMonth: number
    periodYear: number
    targetAmount: number
  }): SalesQuota {
    return new SalesQuota(
      crypto.randomUUID(),
      props.tenantId,
      props.userId,
      props.teamId ?? null,
      props.periodMonth,
      props.periodYear,
      props.targetAmount,
      0,
      new Date(),
    )
  }

  updateAchieved(achievedAmount: number): SalesQuota {
    return new SalesQuota(
      this.id,
      this.tenantId,
      this.userId,
      this.teamId,
      this.periodMonth,
      this.periodYear,
      this.targetAmount,
      achievedAmount,
      this.createdAt,
    )
  }
}
