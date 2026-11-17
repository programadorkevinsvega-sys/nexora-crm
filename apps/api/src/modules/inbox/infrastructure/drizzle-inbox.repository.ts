import { Injectable } from '@nestjs/common'
import { InboxRepository } from '../domain/repositories/inbox.repository'
import { InboxConversation } from '../domain/entities/inbox-conversation.entity'
import { InboxMessage } from '../domain/entities/inbox-message.entity'
import { InboxChannel, InboxConversationStatus } from '@crm/contracts'
import { InboxConversationsDrizzleHelper } from './inbox-conversations.drizzle'
import { InboxMessagesDrizzleHelper } from './inbox-messages.drizzle'

@Injectable()
export class DrizzleInboxRepository extends InboxRepository {
  listConversations(
    tenantId: string,
    filters?: { channel?: InboxChannel; status?: InboxConversationStatus },
  ): Promise<InboxConversation[]> {
    return InboxConversationsDrizzleHelper.listConversations(tenantId, filters)
  }

  getConversation(tenantId: string, id: string): Promise<InboxConversation | null> {
    return InboxConversationsDrizzleHelper.getConversation(tenantId, id)
  }

  sendMessage(
    tenantId: string,
    data: {
      conversationId?: string
      contactId?: string
      channel: InboxChannel
      recipientIdentifier: string
      subject?: string
      bodyText: string
    },
  ): Promise<InboxMessage> {
    return InboxMessagesDrizzleHelper.sendMessage(tenantId, data)
  }
}
