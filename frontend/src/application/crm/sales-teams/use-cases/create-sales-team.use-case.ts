import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { SalesTeamRepository } from "@/src/domain/crm/sales-teams/sales-team.repository"
import type { SalesTeam, SalesTeamCreateInput } from "@/src/domain/crm/sales-teams/sales-team.entity"

export class CreateSalesTeamUseCase {
  constructor(private repository: SalesTeamRepository) {}

  async execute(data: SalesTeamCreateInput): Promise<Result<SalesTeam>> {
    try {
      const team = await this.repository.create(data)
      return success(team)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
