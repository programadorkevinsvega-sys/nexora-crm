export type CampaignStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export class Campaign {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly type: string | null,
    readonly status: CampaignStatus,
    readonly startDate: string | null,
    readonly endDate: string | null,
    readonly budgetedCost: number | null,
    readonly actualCost: number | null,
    readonly expectedRevenue: number | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    type?: string
    status?: CampaignStatus
    startDate?: string
    endDate?: string
    budgetedCost?: number
    actualCost?: number
    expectedRevenue?: number
  }): Campaign {
    return new Campaign(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.type ?? null,
      props.status ?? 'PLANNED',
      props.startDate ?? null,
      props.endDate ?? null,
      props.budgetedCost ?? null,
      props.actualCost ?? null,
      props.expectedRevenue ?? null,
      new Date(),
      new Date(),
    )
  }

  update(props: Partial<Omit<Campaign, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Campaign {
    return new Campaign(
      this.id,
      this.tenantId,
      props.name ?? this.name,
      props.type !== undefined ? props.type : this.type,
      props.status ?? this.status,
      props.startDate !== undefined ? props.startDate : this.startDate,
      props.endDate !== undefined ? props.endDate : this.endDate,
      props.budgetedCost !== undefined ? props.budgetedCost : this.budgetedCost,
      props.actualCost !== undefined ? props.actualCost : this.actualCost,
      props.expectedRevenue !== undefined ? props.expectedRevenue : this.expectedRevenue,
      this.createdAt,
      new Date(),
    )
  }
}
