import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { AffiliateProgramRepository } from "@/src/domain/crm/affiliates/affiliate-program.repository"

export class DeleteProgramUseCase {
  constructor(private repository: AffiliateProgramRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      await this.repository.delete(id)
      return success(undefined)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
