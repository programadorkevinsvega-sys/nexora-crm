import { HelpdeskConversation } from '../entities/conversation.entity'

export interface ConversationFilter {
  mailboxId?: string
  status?: string
  assigneeUserId?: string
  priority?: string
  search?: string
  cursor?: string
  limit: number
}

export interface PaginatedConversations {
  data: HelpdeskConversation[]
  nextCursor: string | null
}

export abstract class ConversationRepository {
  abstract findById(tenantId: string, id: string): Promise<HelpdeskConversation | null>
  abstract list(tenantId: string, filter: ConversationFilter): Promise<PaginatedConversations>
  abstract save(conversation: HelpdeskConversation): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
