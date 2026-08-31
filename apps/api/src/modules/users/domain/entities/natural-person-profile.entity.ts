export class NaturalPersonProfile {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly identificationNumber: string | null,
    readonly phone: string | null,
    readonly countryCode: string | null,
    readonly preferredLanguage: string,
    readonly timezone: string,
    readonly avatarUrl: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string
    tenantId: string
    firstName: string
    lastName: string
    identificationNumber?: string
    phone?: string
    countryCode?: string
    preferredLanguage?: string
    timezone?: string
    avatarUrl?: string
  }): NaturalPersonProfile {
    return new NaturalPersonProfile(
      props.id,
      props.tenantId,
      props.firstName,
      props.lastName,
      props.identificationNumber ?? null,
      props.phone ?? null,
      props.countryCode ?? null,
      props.preferredLanguage ?? 'es',
      props.timezone ?? 'America/Bogota',
      props.avatarUrl ?? null,
      new Date(),
      new Date(),
    )
  }

  update(props: Partial<Omit<NaturalPersonProfile, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): NaturalPersonProfile {
    return new NaturalPersonProfile(
      this.id,
      this.tenantId,
      props.firstName ?? this.firstName,
      props.lastName ?? this.lastName,
      props.identificationNumber !== undefined ? props.identificationNumber : this.identificationNumber,
      props.phone !== undefined ? props.phone : this.phone,
      props.countryCode !== undefined ? props.countryCode : this.countryCode,
      props.preferredLanguage ?? this.preferredLanguage,
      props.timezone ?? this.timezone,
      props.avatarUrl !== undefined ? props.avatarUrl : this.avatarUrl,
      this.createdAt,
      new Date(),
    )
  }
}
