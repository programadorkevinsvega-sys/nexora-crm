import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { ICompanyRepository, CompanyFilters } from "@/src/domain/crm/companies/company.repository"
import type { Company } from "@/src/domain/crm/companies/company.entity"

export class ListCompaniesUseCase {
  constructor(private repository: ICompanyRepository) {}

  async execute(filters?: CompanyFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Company>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
