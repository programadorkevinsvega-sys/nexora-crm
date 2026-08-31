import type { Repository } from "../common/repositories/repository.interface"
import type { Company, CompanyCreateInput, CompanyUpdateInput } from "./company.entity"

export interface CompanyFilters {
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export type CompanyRepository = Repository<Company, CompanyCreateInput, CompanyUpdateInput, CompanyFilters>
export type ICompanyRepository = CompanyRepository
