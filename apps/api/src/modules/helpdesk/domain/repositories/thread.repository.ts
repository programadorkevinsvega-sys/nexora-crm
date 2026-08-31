import { HelpdeskThread } from '../entities/thread.entity'

export abstract class ThreadRepository {
  abstract findById(tenantId: string, id: string): Promise<HelpdeskThread | null>
  abstract findByConversationId(tenantId: string, conversationId: string): Promise<HelpdeskThread[]>
  abstract save(thread: HelpdeskThread): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
