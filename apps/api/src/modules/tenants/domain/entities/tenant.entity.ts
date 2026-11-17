export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL'

export class Tenant {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly legalName: string | null,
    readonly taxId: string | null,
    readonly taxRegime: string | null,
    readonly legalAddress: string | null,
    readonly city: string | null,
    readonly postalCode: string | null,
    readonly industryType: string,
    readonly status: TenantStatus,
    readonly timezone: string,
    readonly currencyCode: string,
    readonly ownerUserId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    name: string
    legalName?: string
    taxId?: string
    taxRegime?: string
    legalAddress?: string
    city?: string
    postalCode?: string
    industryType: string
    timezone?: string
    currencyCode?: string
    ownerUserId: string
  }): Tenant {
    return new Tenant(
      crypto.randomUUID(),
      props.name,
      props.legalName ?? null,
      props.taxId ?? null,
      props.taxRegime ?? null,
      props.legalAddress ?? null,
      props.city ?? null,
      props.postalCode ?? null,
      props.industryType,
      'ACTIVE',
      props.timezone ?? 'UTC',
      props.currencyCode ?? 'USD',
      props.ownerUserId,
      new Date(),
      new Date(),
    )
  }

  update(props: Partial<{
    name: string; legalName: string | null; taxId: string | null; taxRegime: string | null
    legalAddress: string | null; city: string | null; postalCode: string | null
    industryType: string; status: TenantStatus; timezone: string; currencyCode: string
  }>): Tenant {
    return new Tenant(
      this.id, props.name ?? this.name,
      props.legalName !== undefined ? props.legalName : this.legalName,
      props.taxId !== undefined ? props.taxId : this.taxId,
      props.taxRegime !== undefined ? props.taxRegime : this.taxRegime,
      props.legalAddress !== undefined ? props.legalAddress : this.legalAddress,
      props.city !== undefined ? props.city : this.city,
      props.postalCode !== undefined ? props.postalCode : this.postalCode,
      props.industryType ?? this.industryType,
      props.status ?? this.status,
      props.timezone ?? this.timezone,
      props.currencyCode ?? this.currencyCode,
      this.ownerUserId,
      this.createdAt, new Date(),
    )
  }
}
