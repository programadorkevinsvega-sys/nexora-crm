import { InboxChannel } from '@crm/contracts'

export class SendInboxMessageCommand {
  constructor(
    readonly tenantId: string,
    readonly channel: InboxChannel,
    readonly recipientIdentifier: string,
    readonly bodyText: string,
    readonly conversationId?: string,
    readonly contactId?: string,
    readonly subject?: string,
  ) {}
}
