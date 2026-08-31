import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { SalesTeamRepository } from "@/src/domain/crm/sales-teams/sales-team.repository"
import type { SalesTeam, SalesTeamUpdateInput } from "@/src/domain/crm/sales-teams/sales-team.entity"

export class UpdateSalesTeamUseCase {
  constructor(private repository: SalesTeamRepository) {}

  async execute(id: string, data: SalesTeamUpdateInput): Promise<Result<SalesTeam>> {
    try {
      const team = await this.repository.update(id, data)
      return success(team)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
