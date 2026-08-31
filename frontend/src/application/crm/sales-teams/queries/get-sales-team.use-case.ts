import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { SalesTeamRepository } from "@/src/domain/crm/sales-teams/sales-team.repository"
import type { SalesTeam } from "@/src/domain/crm/sales-teams/sales-team.entity"

export class GetSalesTeamUseCase {
  constructor(private repository: SalesTeamRepository) {}

  async execute(id: string): Promise<Result<SalesTeam | null>> {
    try {
      const team = await this.repository.getById(id)
      return success(team)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
