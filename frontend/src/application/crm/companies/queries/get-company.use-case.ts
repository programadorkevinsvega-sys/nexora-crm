import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ICompanyRepository } from "@/src/domain/crm/companies/company.repository"
import type { Company } from "@/src/domain/crm/companies/company.entity"

export class GetCompanyUseCase {
  constructor(private repository: ICompanyRepository) {}

  async execute(id: string): Promise<Result<Company | null>> {
    try {
      const company = await this.repository.getById(id)
      return success(company)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
