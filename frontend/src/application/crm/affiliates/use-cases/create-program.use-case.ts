import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { AffiliateProgramRepository } from "@/src/domain/crm/affiliates/affiliate-program.repository"
import type { AffiliateProgram, ProgramCreateInput } from "@/src/domain/crm/affiliates/affiliate-program.entity"

export class CreateProgramUseCase {
  constructor(private repository: AffiliateProgramRepository) {}

  async execute(data: ProgramCreateInput): Promise<Result<AffiliateProgram>> {
    try {
      const program = await this.repository.create(data)
      return success(program)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
