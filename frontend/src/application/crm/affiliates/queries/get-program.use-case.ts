import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { AffiliateProgramRepository } from "@/src/domain/crm/affiliates/affiliate-program.repository"
import type { AffiliateProgram } from "@/src/domain/crm/affiliates/affiliate-program.entity"

export class GetProgramUseCase {
  constructor(private repository: AffiliateProgramRepository) {}

  async execute(id: string): Promise<Result<AffiliateProgram | null>> {
    try {
      const program = await this.repository.getById(id)
      return success(program)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
