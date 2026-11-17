import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ICompanyRepository } from "@/src/domain/crm/companies/company.repository"
import type { Company, CompanyCreateInput } from "@/src/domain/crm/companies/company.entity"

export class CreateCompanyUseCase {
  constructor(private repository: ICompanyRepository) {}

  async execute(data: CompanyCreateInput): Promise<Result<Company>> {
    try {
      const company = await this.repository.create(data)
      return success(company)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
