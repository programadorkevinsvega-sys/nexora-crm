import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { SalesTeamRepository, SalesTeamFilters } from "@/src/domain/crm/sales-teams/sales-team.repository"
import type { SalesTeam } from "@/src/domain/crm/sales-teams/sales-team.entity"

export class ListSalesTeamsUseCase {
  constructor(private repository: SalesTeamRepository) {}

  async execute(filters?: SalesTeamFilters, pagination?: Pagination): Promise<Result<PaginatedResult<SalesTeam>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
