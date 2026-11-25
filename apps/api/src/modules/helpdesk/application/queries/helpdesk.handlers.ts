import { Injectable } from '@nestjs/common'
import { ConversationRepository } from '../../domain/repositories/conversation.repository'
import { ThreadRepository } from '../../domain/repositories/thread.repository'
import { AgentRepository } from '../../domain/repositories/agent.repository'
import { MailboxRepository } from '../../domain/repositories/mailbox.repository'
import { NotFoundError } from '@crm/shared'
import {
  GetConversationQuery,
  ListConversationsQuery,
  ListThreadsQuery,
  GetAgentProfileQuery,
  ListMailboxesQuery,
} from './helpdesk.queries'

@Injectable()
export class GetConversationHandler {
  constructor(private readonly repo: ConversationRepository) {}

  async execute(query: GetConversationQuery) {
    const conversation = await this.repo.findById(query.tenantId, query.id)
    if (!conversation) throw new NotFoundError('Conversation', query.id)
    return conversation
  }
}

@Injectable()
export class ListConversationsHandler {
  constructor(private readonly repo: ConversationRepository) {}

  async execute(query: ListConversationsQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}

@Injectable()
export class ListThreadsHandler {
  constructor(private readonly repo: ThreadRepository) {}

  async execute(query: ListThreadsQuery) {
    return this.repo.findByConversationId(query.tenantId, query.conversationId)
  }
}

@Injectable()
export class GetAgentProfileHandler {
  constructor(private readonly repo: AgentRepository) {}

  async execute(query: GetAgentProfileQuery) {
    const profile = await this.repo.findByUserId(query.tenantId, query.userId)
    if (!profile) throw new NotFoundError('Agent Profile', query.userId)
    return profile
  }
}

@Injectable()
export class ListMailboxesHandler {
  constructor(private readonly repo: MailboxRepository) {}

  async execute(query: ListMailboxesQuery) {
    return this.repo.list(query.tenantId)
  }
}
