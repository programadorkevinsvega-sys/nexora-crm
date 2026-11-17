import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { ConversationRepository, ConversationFilters } from "@/src/domain/crm/helpdesk/conversation.repository"
import type { Conversation } from "@/src/domain/crm/helpdesk/conversation.entity"

export class ListConversationsUseCase {
  constructor(private repository: ConversationRepository) {}

  async execute(filters?: ConversationFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Conversation>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
