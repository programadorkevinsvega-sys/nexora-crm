import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { QuoteRepository, QuoteFilters } from "@/src/domain/crm/contracts/quote.repository"
import type { Quote } from "@/src/domain/crm/contracts/quote.entity"

export class ListQuotesUseCase {
  constructor(private repository: QuoteRepository) {}

  async execute(filters?: QuoteFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Quote>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
