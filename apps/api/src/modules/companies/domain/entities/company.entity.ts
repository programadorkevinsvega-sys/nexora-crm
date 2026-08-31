export class Company {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly taxId: string | null,
    readonly website: string | null,
    readonly industry: string | null,
    readonly numberOfEmployees: number | null,
    readonly annualRevenue: number | null,
    readonly description: string | null,
    readonly parentCompanyId: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    taxId?: string
    website?: string
    industry?: string
    numberOfEmployees?: number
    annualRevenue?: number
    description?: string
    parentCompanyId?: string
  }): Company {
    return new Company(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.taxId ?? null,
      props.website ?? null,
      props.industry ?? null,
      props.numberOfEmployees ?? null,
      props.annualRevenue ?? null,
      props.description ?? null,
      props.parentCompanyId ?? null,
      new Date(),
      new Date(),
    )
  }

  update(props: Partial<Omit<Company, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Company {
    return new Company(
      this.id,
      this.tenantId,
      props.name ?? this.name,
      props.taxId !== undefined ? props.taxId : this.taxId,
      props.website !== undefined ? props.website : this.website,
      props.industry !== undefined ? props.industry : this.industry,
      props.numberOfEmployees !== undefined ? props.numberOfEmployees : this.numberOfEmployees,
      props.annualRevenue !== undefined ? props.annualRevenue : this.annualRevenue,
      props.description !== undefined ? props.description : this.description,
      props.parentCompanyId !== undefined ? props.parentCompanyId : this.parentCompanyId,
      this.createdAt,
      new Date(),
    )
  }
}
