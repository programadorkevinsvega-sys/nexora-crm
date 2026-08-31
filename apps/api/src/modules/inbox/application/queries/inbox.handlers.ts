import { Injectable, NotFoundException } from '@nestjs/common'
import { ListInboxConversationsQuery, GetInboxConversationQuery } from './inbox.queries'
import { InboxRepository } from '../../domain/repositories/inbox.repository'
import { InboxConversation } from '../../domain/entities/inbox-conversation.entity'

@Injectable()
export class ListInboxConversationsHandler {
  constructor(private readonly repo: InboxRepository) {}

  async execute(query: ListInboxConversationsQuery): Promise<InboxConversation[]> {
    return this.repo.listConversations(query.tenantId, {
      channel: query.channel,
      status: query.status,
    })
  }
}

@Injectable()
export class GetInboxConversationHandler {
  constructor(private readonly repo: InboxRepository) {}

  async execute(query: GetInboxConversationQuery): Promise<InboxConversation> {
    const convo = await this.repo.getConversation(query.tenantId, query.id)
    if (!convo) {
      throw new NotFoundException(`Conversation with id ${query.id} not found`)
    }
    return convo
  }
}
