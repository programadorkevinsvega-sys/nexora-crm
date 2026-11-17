export class SalesTeam {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly managerUserId: string | null,
    readonly monthlyTarget: number | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    managerUserId?: string
    monthlyTarget?: number
  }): SalesTeam {
    return new SalesTeam(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.managerUserId ?? null,
      props.monthlyTarget ?? null,
      new Date(),
      new Date(),
    )
  }

  update(props: Partial<Omit<SalesTeam, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): SalesTeam {
    return new SalesTeam(
      this.id,
      this.tenantId,
      props.name ?? this.name,
      props.managerUserId !== undefined ? props.managerUserId : this.managerUserId,
      props.monthlyTarget !== undefined ? props.monthlyTarget : this.monthlyTarget,
      this.createdAt,
      new Date(),
    )
  }
}
