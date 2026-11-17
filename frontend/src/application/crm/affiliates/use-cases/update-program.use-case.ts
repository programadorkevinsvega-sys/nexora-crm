import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { AffiliateProgramRepository } from "@/src/domain/crm/affiliates/affiliate-program.repository"
import type { AffiliateProgram, ProgramUpdateInput } from "@/src/domain/crm/affiliates/affiliate-program.entity"

export class UpdateProgramUseCase {
  constructor(private repository: AffiliateProgramRepository) {}

  async execute(id: string, data: ProgramUpdateInput): Promise<Result<AffiliateProgram>> {
    try {
      const program = await this.repository.update(id, data)
      return success(program)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
