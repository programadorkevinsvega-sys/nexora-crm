import type { Repository } from "../common/repositories/repository.interface"
import type { Conversation, ConversationCreateInput, ConversationUpdateInput } from "./conversation.entity"

export interface ConversationFilters {
  tenantId?: string
  status?: string
  priority?: string
  mailboxId?: string
  assigneeUserId?: string
  search?: string
  cursor?: string
  limit?: number
}

export type ConversationRepository = Repository<Conversation, ConversationCreateInput, ConversationUpdateInput, ConversationFilters>
