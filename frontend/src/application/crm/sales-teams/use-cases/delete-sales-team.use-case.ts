import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { SalesTeamRepository } from "@/src/domain/crm/sales-teams/sales-team.repository"

export class DeleteSalesTeamUseCase {
  constructor(private repository: SalesTeamRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      await this.repository.delete(id)
      return success(undefined)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
