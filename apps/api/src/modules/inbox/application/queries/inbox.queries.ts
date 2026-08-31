import { InboxChannel, InboxConversationStatus } from '@crm/contracts'

export class ListInboxConversationsQuery {
  constructor(
    readonly tenantId: string,
    readonly channel?: InboxChannel,
    readonly status?: InboxConversationStatus,
  ) {}
}

export class GetInboxConversationQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}
