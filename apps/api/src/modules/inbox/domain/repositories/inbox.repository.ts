import { InboxConversation } from '../entities/inbox-conversation.entity'
import { InboxMessage } from '../entities/inbox-message.entity'
import { InboxChannel, InboxConversationStatus } from '@crm/contracts'

export abstract class InboxRepository {
  abstract listConversations(
    tenantId: string,
    filters?: { channel?: InboxChannel; status?: InboxConversationStatus },
  ): Promise<InboxConversation[]>

  abstract getConversation(tenantId: string, id: string): Promise<InboxConversation | null>

  abstract sendMessage(
    tenantId: string,
    data: {
      conversationId?: string
      contactId?: string
      channel: InboxChannel
      recipientIdentifier: string
      subject?: string
      bodyText: string
    },
  ): Promise<InboxMessage>
}
