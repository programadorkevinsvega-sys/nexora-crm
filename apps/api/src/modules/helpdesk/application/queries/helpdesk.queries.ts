import { ConversationFilter } from '../../domain/repositories/conversation.repository'

export class GetConversationQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListConversationsQuery {
  constructor(readonly tenantId: string, readonly filter: ConversationFilter) {}
}

export class ListThreadsQuery {
  constructor(readonly tenantId: string, readonly conversationId: string) {}
}

export class GetAgentProfileQuery {
  constructor(readonly tenantId: string, readonly userId: string) {}
}

export class ListMailboxesQuery {
  constructor(readonly tenantId: string) {}
}
