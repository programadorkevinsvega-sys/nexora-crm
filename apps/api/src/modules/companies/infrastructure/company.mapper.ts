import { Company } from '../domain/entities/company.entity'

type CompanyRow = {
  id: string
  tenantId: string
  name: string
  taxId: string | null
  website: string | null
  phone: string | null
  email: string | null
  country: string | null
  city: string | null
  address: string | null
  industry: string | null
  numberOfEmployees: number | null
  annualRevenue: string | null
  description: string | null
  parentCompanyId: string | null
  linkedinUrl: string | null
  logoUrl: string | null
  lifecycleStage: string | null
  assignedUserId: string | null
  healthScore: number | null
  tier: string | null
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
      row.phone,
      row.email,
      row.country,
      row.city,
      row.address,
      row.industry,
      row.numberOfEmployees,
      row.annualRevenue ? Number(row.annualRevenue) : null,
      row.description,
      row.parentCompanyId,
      row.linkedinUrl,
      row.logoUrl,
      row.lifecycleStage,
      row.assignedUserId,
      row.healthScore,
      row.tier,
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
      phone: company.phone,
      email: company.email,
      country: company.country,
      city: company.city,
      address: company.address,
      industry: company.industry,
      numberOfEmployees: company.numberOfEmployees,
      annualRevenue: company.annualRevenue?.toString() ?? null,
      description: company.description,
      parentCompanyId: company.parentCompanyId,
      linkedinUrl: company.linkedinUrl,
      logoUrl: company.logoUrl,
      lifecycleStage: company.lifecycleStage,
      assignedUserId: company.assignedUserId,
      healthScore: company.healthScore,
      tier: company.tier,
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
      phone: company.phone,
      email: company.email,
      country: company.country,
      city: company.city,
      address: company.address,
      industry: company.industry,
      numberOfEmployees: company.numberOfEmployees,
      annualRevenue: company.annualRevenue,
      description: company.description,
      parentCompanyId: company.parentCompanyId,
      linkedinUrl: company.linkedinUrl,
      logoUrl: company.logoUrl,
      lifecycleStage: company.lifecycleStage,
      assignedUserId: company.assignedUserId,
      healthScore: company.healthScore,
      tier: company.tier,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    }
  }
}
