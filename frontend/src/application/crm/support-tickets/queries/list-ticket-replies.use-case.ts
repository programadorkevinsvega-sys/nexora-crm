import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { TicketReply } from "@/src/domain/crm/support-tickets/ticket-reply.entity"

export interface TicketReplyRepository {
  listByTicketId(ticketId: string, pagination?: Pagination): Promise<PaginatedResult<TicketReply>>
}

export class ListTicketRepliesUseCase {
  constructor(private repository: TicketReplyRepository) {}

  async execute(ticketId: string, pagination?: Pagination): Promise<Result<PaginatedResult<TicketReply>>> {
    try {
      const result = await this.repository.listByTicketId(ticketId, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
