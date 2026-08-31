import { Company } from '../domain/entities/company.entity'

type CompanyRow = {
  id: string
  tenantId: string
  name: string
  taxId: string | null
  website: string | null
  industry: string | null
  numberOfEmployees: number | null
  annualRevenue: string | null
  description: string | null
  parentCompanyId: string | null
  createdAt: Date
  updatedAt: Date
}

export class CompanyMapper {
  static toDomain(row: CompanyRow): Company {
    return new Company(
      row.id,
      row.tenantId,
      row.name,
      row.taxId,
      row.website,
      row.industry,
      row.numberOfEmployees,
      row.annualRevenue ? Number(row.annualRevenue) : null,
      row.description,
      row.parentCompanyId,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(company: Company): CompanyRow {
    return {
      id: company.id,
      tenantId: company.tenantId,
      name: company.name,
      taxId: company.taxId,
      website: company.website,
      industry: company.industry,
      numberOfEmployees: company.numberOfEmployees,
      annualRevenue: company.annualRevenue?.toString() ?? null,
      description: company.description,
      parentCompanyId: company.parentCompanyId,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }
  }

  static toResponse(company: Company) {
    return {
      id: company.id,
      name: company.name,
      taxId: company.taxId,
      website: company.website,
      industry: company.industry,
      numberOfEmployees: company.numberOfEmployees,
      annualRevenue: company.annualRevenue,
      description: company.description,
      parentCompanyId: company.parentCompanyId,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    }
  }
}
