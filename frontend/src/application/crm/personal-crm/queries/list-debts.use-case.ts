import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { DebtRepository } from "@/src/domain/crm/personal-crm/debt.repository"
import type { Debt } from "@/src/domain/crm/personal-crm/debt.entity"

export class ListDebtsUseCase {
  constructor(private repository: DebtRepository) {}

  async execute(contactId: string, pagination?: Pagination): Promise<Result<PaginatedResult<Debt>>> {
    try {
      const result = await this.repository.listByContactId(contactId, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
