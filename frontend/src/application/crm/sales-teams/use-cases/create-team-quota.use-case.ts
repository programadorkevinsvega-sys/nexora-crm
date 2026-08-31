import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { SalesTeamRepository } from "@/src/domain/crm/sales-teams/sales-team.repository"
import type { SalesQuota, SalesQuotaCreateInput } from "@/src/domain/crm/sales-teams/sales-quota.entity"

export interface SalesTeamRepositoryExtended extends SalesTeamRepository {
  createQuota(teamId: string, data: SalesQuotaCreateInput): Promise<SalesQuota>
}

export class CreateTeamQuotaUseCase {
  constructor(private repository: SalesTeamRepositoryExtended) {}

  async execute(teamId: string, data: SalesQuotaCreateInput): Promise<Result<SalesQuota>> {
    try {
      const quota = await this.repository.createQuota(teamId, data)
      return success(quota)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
