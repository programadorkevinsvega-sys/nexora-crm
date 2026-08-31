import { Company } from '../entities/company.entity'

export interface CompanyFilter {
  search?: string
  industry?: string
  cursor?: string
  limit: number
}

export interface PaginatedCompanies {
  data: Company[]
  nextCursor: string | null
}

export abstract class CompanyRepository {
  abstract findById(tenantId: string, id: string): Promise<Company | null>
  abstract findByName(tenantId: string, name: string): Promise<Company | null>
  abstract list(tenantId: string, filter: CompanyFilter): Promise<PaginatedCompanies>
  abstract save(company: Company): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
