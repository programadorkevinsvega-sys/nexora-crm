export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'RENEWED'

export class Contract {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly companyId: string,
    readonly dealId: string | null,
    readonly name: string,
    readonly startDate: string,
    readonly endDate: string | null,
    readonly autoRenew: boolean,
    readonly mrrValue: number,
    readonly status: ContractStatus,
    readonly ownerUserId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    companyId: string
    dealId?: string
    name: string
    startDate: string
    endDate?: string
    autoRenew?: boolean
    mrrValue?: number
    ownerUserId: string
  }): Contract {
    return new Contract(
      crypto.randomUUID(),
      props.tenantId,
      props.companyId,
      props.dealId ?? null,
      props.name,
      props.startDate,
      props.endDate ?? null,
      props.autoRenew ?? false,
      props.mrrValue ?? 0,
      'DRAFT',
      props.ownerUserId,
      new Date(),
      new Date(),
    )
  }

  update(props: Partial<Omit<Contract, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Contract {
    return new Contract(
      this.id,
      this.tenantId,
      this.companyId,
      props.dealId !== undefined ? props.dealId : this.dealId,
      props.name ?? this.name,
      props.startDate ?? this.startDate,
      props.endDate !== undefined ? props.endDate : this.endDate,
      props.autoRenew ?? this.autoRenew,
      props.mrrValue ?? this.mrrValue,
      props.status ?? this.status,
      props.ownerUserId ?? this.ownerUserId,
      this.createdAt,
      new Date(),
    )
  }

  updateStatus(status: ContractStatus): Contract {
    return new Contract(
      this.id,
      this.tenantId,
      this.companyId,
      this.dealId,
      this.name,
      this.startDate,
      this.endDate,
      this.autoRenew,
      this.mrrValue,
      status,
      this.ownerUserId,
      this.createdAt,
      new Date(),
    )
  }
}
