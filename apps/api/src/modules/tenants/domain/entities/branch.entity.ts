export class Branch {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly code: string | null,
    readonly address: string | null,
    readonly city: string | null,
    readonly country: string | null,
    readonly isActive: boolean,
    readonly isHeadquarters: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    code?: string
    address?: string
    city?: string
    country?: string
    isHeadquarters?: boolean
  }): Branch {
    return new Branch(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.code ?? null,
      props.address ?? null,
      props.city ?? null,
      props.country ?? null,
      true,
      props.isHeadquarters ?? false,
      new Date(), new Date(),
    )
  }

  update(props: Partial<{
    name: string; code: string | null; address: string | null
    city: string | null; country: string | null; isActive: boolean; isHeadquarters: boolean
  }>): Branch {
    return new Branch(
      this.id, this.tenantId,
      props.name ?? this.name,
      props.code !== undefined ? props.code : this.code,
      props.address !== undefined ? props.address : this.address,
      props.city !== undefined ? props.city : this.city,
      props.country !== undefined ? props.country : this.country,
      props.isActive ?? this.isActive,
      props.isHeadquarters ?? this.isHeadquarters,
      this.createdAt, new Date(),
    )
  }
}
