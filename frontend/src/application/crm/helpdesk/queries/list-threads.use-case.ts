import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { ThreadRepository } from "@/src/domain/crm/helpdesk/thread.repository"
import type { Thread } from "@/src/domain/crm/helpdesk/thread.entity"

export class ListThreadsUseCase {
  constructor(private repository: ThreadRepository) {}

  async execute(conversationId: string, pagination?: Pagination): Promise<Result<PaginatedResult<Thread>>> {
    try {
      const result = await this.repository.listByConversationId(conversationId, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
