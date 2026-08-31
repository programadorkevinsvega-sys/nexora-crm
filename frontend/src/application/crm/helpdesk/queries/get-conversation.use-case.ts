import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ConversationRepository } from "@/src/domain/crm/helpdesk/conversation.repository"
import type { Conversation } from "@/src/domain/crm/helpdesk/conversation.entity"

export class GetConversationUseCase {
  constructor(private repository: ConversationRepository) {}

  async execute(id: string): Promise<Result<Conversation | null>> {
    try {
      const conversation = await this.repository.getById(id)
      return success(conversation)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
