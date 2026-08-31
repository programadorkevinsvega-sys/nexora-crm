import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { SalesTeamRepository } from "@/src/domain/crm/sales-teams/sales-team.repository"
import type { SalesQuota } from "@/src/domain/crm/sales-teams/sales-quota.entity"

export interface SalesTeamRepositoryExtended extends SalesTeamRepository {
  listQuotas(teamId: string, pagination?: Pagination): Promise<PaginatedResult<SalesQuota>>
}

export class ListTeamQuotasUseCase {
  constructor(private repository: SalesTeamRepositoryExtended) {}

  async execute(teamId: string, pagination?: Pagination): Promise<Result<PaginatedResult<SalesQuota>>> {
    try {
      const result = await this.repository.listQuotas(teamId, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
