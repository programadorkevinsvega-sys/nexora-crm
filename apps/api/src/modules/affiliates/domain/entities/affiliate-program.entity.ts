export class AffiliateProgram {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly commissionType: string,
    readonly commissionValue: number,
    readonly cookieDurationDays: number | null,
    readonly isMultiLevel: boolean | null,
    readonly maxMlmLevels: number | null,
    readonly isActive: boolean | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    commissionType: string
    commissionValue: number
    cookieDurationDays?: number
    isMultiLevel?: boolean
    maxMlmLevels?: number
    isActive?: boolean
  }): AffiliateProgram {
    return new AffiliateProgram(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.commissionType,
      props.commissionValue,
      props.cookieDurationDays ?? null,
      props.isMultiLevel ?? null,
      props.maxMlmLevels ?? null,
      props.isActive ?? null,
      new Date(),
      new Date(),
    )
  }

  update(props: Partial<Omit<AffiliateProgram, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): AffiliateProgram {
    return new AffiliateProgram(
      this.id,
      this.tenantId,
      props.name ?? this.name,
      props.commissionType ?? this.commissionType,
      props.commissionValue !== undefined ? props.commissionValue : this.commissionValue,
      props.cookieDurationDays !== undefined ? props.cookieDurationDays : this.cookieDurationDays,
      props.isMultiLevel !== undefined ? props.isMultiLevel : this.isMultiLevel,
      props.maxMlmLevels !== undefined ? props.maxMlmLevels : this.maxMlmLevels,
      props.isActive !== undefined ? props.isActive : this.isActive,
      this.createdAt,
      new Date(),
    )
  }
}
