import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { CallRepository, CallFilters } from "@/src/domain/crm/calls/call.repository"
import type { Call } from "@/src/domain/crm/calls/call.entity"

export class ListCallsUseCase {
  constructor(private repository: CallRepository) {}

  async execute(filters?: CallFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Call>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
