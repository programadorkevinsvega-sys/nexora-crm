export class LegalEntityProfile {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly legalName: string,
    readonly commercialName: string | null,
    readonly taxId: string,
    readonly legalAddress: string | null,
    readonly countryCode: string | null,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string
    tenantId: string
    legalName: string
    commercialName?: string
    taxId: string
    legalAddress?: string
    countryCode?: string
  }): LegalEntityProfile {
    return new LegalEntityProfile(
      props.id,
      props.tenantId,
      props.legalName,
      props.commercialName ?? null,
      props.taxId,
      props.legalAddress ?? null,
      props.countryCode ?? null,
      true,
      new Date(),
      new Date(),
    )
  }

  update(props: Partial<Omit<LegalEntityProfile, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): LegalEntityProfile {
    return new LegalEntityProfile(
      this.id,
      this.tenantId,
      props.legalName ?? this.legalName,
      props.commercialName !== undefined ? props.commercialName : this.commercialName,
      props.taxId ?? this.taxId,
      props.legalAddress !== undefined ? props.legalAddress : this.legalAddress,
      props.countryCode !== undefined ? props.countryCode : this.countryCode,
      props.isActive !== undefined ? props.isActive : this.isActive,
      this.createdAt,
      new Date(),
    )
  }
}
