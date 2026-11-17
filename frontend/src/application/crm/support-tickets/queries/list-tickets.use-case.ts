import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { TicketRepository, TicketFilters } from "@/src/domain/crm/support-tickets/ticket.repository"
import type { Ticket } from "@/src/domain/crm/support-tickets/ticket.entity"

export class ListTicketsUseCase {
  constructor(private repository: TicketRepository) {}

  async execute(filters?: TicketFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Ticket>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
