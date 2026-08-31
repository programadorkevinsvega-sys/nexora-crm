import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { SalesTeamRepository } from "@/src/domain/crm/sales-teams/sales-team.repository"

export interface SalesTeamRepositoryExtended extends SalesTeamRepository {
  listMembers(teamId: string): Promise<string[]>
}

export class ListTeamMembersUseCase {
  constructor(private repository: SalesTeamRepositoryExtended) {}

  async execute(teamId: string): Promise<Result<string[]>> {
    try {
      const members = await this.repository.listMembers(teamId)
      return success(members)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
