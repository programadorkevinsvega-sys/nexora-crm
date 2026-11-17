import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { SalesTeamRepository } from "@/src/domain/crm/sales-teams/sales-team.repository"

export interface SalesTeamRepositoryExtended extends SalesTeamRepository {
  removeMember(teamId: string, userId: string): Promise<void>
}

export class RemoveTeamMemberUseCase {
  constructor(private repository: SalesTeamRepositoryExtended) {}

  async execute(teamId: string, userId: string): Promise<Result<void>> {
    try {
      await this.repository.removeMember(teamId, userId)
      return success(undefined)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
