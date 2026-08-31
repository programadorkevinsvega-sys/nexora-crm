import type { PaginatedResult } from "../common/results/paginated-result"
import type { Pagination } from "../common/value-objects/Pagination"
import type { Thread, ThreadCreateInput } from "./thread.entity"

export interface ThreadRepository {
  listByConversationId(conversationId: string, pagination?: Pagination): Promise<PaginatedResult<Thread>>
  create(data: ThreadCreateInput): Promise<Thread>
}
