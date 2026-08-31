import { Entity } from "../common/entities/base.entity"

export interface CompanyProps {
  tenantId: string
  name: string
  industry: string | null
  website: string | null
  taxId: string | null
  numberOfEmployees: number | null
  annualRevenue: number | null
  description: string | null
  parentCompanyId: string | null
}

export class Company extends Entity<CompanyProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get name(): string {
    return this.props.name
  }

  get industry(): string | null {
    return this.props.industry
  }

  get website(): string | null {
    return this.props.website
  }

  get taxId(): string | null {
    return this.props.taxId
  }

  get numberOfEmployees(): number | null {
    return this.props.numberOfEmployees
  }

  get annualRevenue(): number | null {
    return this.props.annualRevenue
  }

  get description(): string | null {
    return this.props.description
  }

  get parentCompanyId(): string | null {
    return this.props.parentCompanyId
  }

  static create(
    props: CompanyCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Company {
    return new Company(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      name: props.name,
      industry: props.industry ?? null,
      website: props.website ?? null,
      taxId: props.taxId ?? null,
      numberOfEmployees: props.numberOfEmployees ?? null,
      annualRevenue: props.annualRevenue ?? null,
      description: props.description ?? null,
      parentCompanyId: props.parentCompanyId ?? null,
    })
  }

  update(input: CompanyUpdateInput): void {
    if (input.name !== undefined) {
      this.props.name = input.name
    }
    if (input.industry !== undefined) {
      this.props.industry = input.industry
    }
    if (input.website !== undefined) {
      this.props.website = input.website
    }
    if (input.taxId !== undefined) {
      this.props.taxId = input.taxId
    }
    if (input.numberOfEmployees !== undefined) {
      this.props.numberOfEmployees = input.numberOfEmployees
    }
    if (input.annualRevenue !== undefined) {
      this.props.annualRevenue = input.annualRevenue
    }
    if (input.description !== undefined) {
      this.props.description = input.description
    }
    if (input.parentCompanyId !== undefined) {
      this.props.parentCompanyId = input.parentCompanyId
    }
    this.touch()
  }
}

export interface CompanyCreateInput {
  tenantId: string
  name: string
  industry?: string | null
  website?: string | null
  taxId?: string | null
  numberOfEmployees?: number | null
  annualRevenue?: number | null
  description?: string | null
  parentCompanyId?: string | null
}

export interface CompanyUpdateInput {
  name?: string
  industry?: string | null
  website?: string | null
  taxId?: string | null
  numberOfEmployees?: number | null
  annualRevenue?: number | null
  description?: string | null
  parentCompanyId?: string | null
}
