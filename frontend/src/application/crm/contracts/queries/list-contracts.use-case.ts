import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { ContractRepository, ContractFilters } from "@/src/domain/crm/contracts/contract.repository"
import type { Contract } from "@/src/domain/crm/contracts/contract.entity"

export class ListContractsUseCase {
  constructor(private repository: ContractRepository) {}

  async execute(filters?: ContractFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Contract>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
