import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ConversationRepository } from "@/src/domain/crm/helpdesk/conversation.repository"
import type { Conversation } from "@/src/domain/crm/helpdesk/conversation.entity"

export interface ConversationRepositoryExtended extends ConversationRepository {
  close(id: string): Promise<Conversation>
}

export class CloseConversationUseCase {
  constructor(private repository: ConversationRepositoryExtended) {}

  async execute(id: string): Promise<Result<Conversation>> {
    try {
      const conversation = await this.repository.close(id)
      return success(conversation)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
