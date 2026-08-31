import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ConversationRepository } from "@/src/domain/crm/helpdesk/conversation.repository"
import type { Conversation, ConversationCreateInput } from "@/src/domain/crm/helpdesk/conversation.entity"

export class CreateConversationUseCase {
  constructor(private repository: ConversationRepository) {}

  async execute(data: ConversationCreateInput): Promise<Result<Conversation>> {
    try {
      const conversation = await this.repository.create(data)
      return success(conversation)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
