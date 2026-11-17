import { Entity } from "../common/entities/base.entity"

export interface CompanyProps {
  tenantId: string
  name: string
  industry: string | null
  website: string | null
  phone: string | null
  email: string | null
  country: string | null
  city: string | null
  address: string | null
  taxId: string | null
  numberOfEmployees: number | null
  annualRevenue: number | null
  description: string | null
  parentCompanyId: string | null
  linkedinUrl: string | null
  logoUrl: string | null
  lifecycleStage: string | null
  tier: string | null
  healthScore: number | null
}

export class Company extends Entity<CompanyProps> {
  get tenantId(): string { return this.props.tenantId }
  get name(): string { return this.props.name }
  get industry(): string | null { return this.props.industry }
  get website(): string | null { return this.props.website }
  get phone(): string | null { return this.props.phone }
  get email(): string | null { return this.props.email }
  get country(): string | null { return this.props.country }
  get city(): string | null { return this.props.city }
  get address(): string | null { return this.props.address }
  get taxId(): string | null { return this.props.taxId }
  get numberOfEmployees(): number | null { return this.props.numberOfEmployees }
  get annualRevenue(): number | null { return this.props.annualRevenue }
  get description(): string | null { return this.props.description }
  get parentCompanyId(): string | null { return this.props.parentCompanyId }
  get linkedinUrl(): string | null { return this.props.linkedinUrl }
  get logoUrl(): string | null { return this.props.logoUrl }
  get lifecycleStage(): string | null { return this.props.lifecycleStage }
  get tier(): string | null { return this.props.tier }
  get healthScore(): number | null { return this.props.healthScore }

  static create(props: CompanyCreateInput, id: string, createdAt: Date | string, updatedAt: Date | string): Company {
    return new Company(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      name: props.name,
      industry: props.industry ?? null,
      website: props.website ?? null,
      phone: props.phone ?? null,
      email: props.email ?? null,
      country: props.country ?? null,
      city: props.city ?? null,
      address: props.address ?? null,
      taxId: props.taxId ?? null,
      numberOfEmployees: props.numberOfEmployees ?? null,
      annualRevenue: props.annualRevenue ?? null,
      description: props.description ?? null,
      parentCompanyId: props.parentCompanyId ?? null,
      linkedinUrl: props.linkedinUrl ?? null,
      logoUrl: props.logoUrl ?? null,
      lifecycleStage: props.lifecycleStage ?? "PROSPECT",
      tier: props.tier ?? "TIER_2",
      healthScore: props.healthScore ?? 100,
    })
  }

  update(input: CompanyUpdateInput): void {
    if (input.name !== undefined) this.props.name = input.name
    if (input.industry !== undefined) this.props.industry = input.industry
    if (input.website !== undefined) this.props.website = input.website
    if (input.phone !== undefined) this.props.phone = input.phone
    if (input.email !== undefined) this.props.email = input.email
    if (input.country !== undefined) this.props.country = input.country
    if (input.city !== undefined) this.props.city = input.city
    if (input.address !== undefined) this.props.address = input.address
    if (input.taxId !== undefined) this.props.taxId = input.taxId
    if (input.numberOfEmployees !== undefined) this.props.numberOfEmployees = input.numberOfEmployees
    if (input.annualRevenue !== undefined) this.props.annualRevenue = input.annualRevenue
    if (input.description !== undefined) this.props.description = input.description
    if (input.parentCompanyId !== undefined) this.props.parentCompanyId = input.parentCompanyId
    if (input.linkedinUrl !== undefined) this.props.linkedinUrl = input.linkedinUrl
    if (input.logoUrl !== undefined) this.props.logoUrl = input.logoUrl
    if (input.lifecycleStage !== undefined) this.props.lifecycleStage = input.lifecycleStage
    if (input.tier !== undefined) this.props.tier = input.tier
    if (input.healthScore !== undefined) this.props.healthScore = input.healthScore
    this.touch()
  }
}

export interface CompanyCreateInput {
  tenantId: string
  name: string
  industry?: string | null
  website?: string | null
  phone?: string | null
  email?: string | null
  country?: string | null
  city?: string | null
  address?: string | null
  taxId?: string | null
  numberOfEmployees?: number | null
  annualRevenue?: number | null
  description?: string | null
  parentCompanyId?: string | null
  linkedinUrl?: string | null
  logoUrl?: string | null
  lifecycleStage?: string | null
  tier?: string | null
  healthScore?: number | null
}

export interface CompanyUpdateInput {
  name?: string
  industry?: string | null
  website?: string | null
  phone?: string | null
  email?: string | null
  country?: string | null
  city?: string | null
  address?: string | null
  taxId?: string | null
  numberOfEmployees?: number | null
  annualRevenue?: number | null
  description?: string | null
  parentCompanyId?: string | null
  linkedinUrl?: string | null
  logoUrl?: string | null
  lifecycleStage?: string | null
  tier?: string | null
  healthScore?: number | null
}
