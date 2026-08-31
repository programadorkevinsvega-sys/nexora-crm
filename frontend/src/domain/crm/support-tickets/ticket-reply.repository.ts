import type { PaginatedResult } from "../common/results/paginated-result"
import type { Pagination } from "../common/value-objects/Pagination"
import type { TicketReply, TicketReplyCreateInput } from "./ticket-reply.entity"

export interface TicketReplyRepository {
  listByTicketId(
    ticketId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<TicketReply>>
  create(data: TicketReplyCreateInput): Promise<TicketReply>
}
