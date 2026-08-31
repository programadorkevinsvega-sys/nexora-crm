import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ICompanyRepository } from "@/src/domain/crm/companies/company.repository"
import type { Company, CompanyUpdateInput } from "@/src/domain/crm/companies/company.entity"

export class UpdateCompanyUseCase {
  constructor(private repository: ICompanyRepository) {}

  async execute(id: string, data: CompanyUpdateInput): Promise<Result<Company>> {
    try {
      const company = await this.repository.update(id, data)
      return success(company)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
