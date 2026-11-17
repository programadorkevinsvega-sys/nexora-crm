import { InboxChannel, InboxConversationStatus } from '@crm/contracts'
import { InboxMessage } from './inbox-message.entity'

export class InboxConversation {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly channel: InboxChannel,
    readonly contactId: string | null,
    readonly contactName: string | null,
    readonly contactEmail: string | null,
    readonly contactPhone: string | null,
    readonly leadScore: number,
    readonly leadTemperature: 'COLD' | 'WARM' | 'HOT',
    readonly subject: string,
    readonly status: InboxConversationStatus,
    readonly lastMessageText: string | null,
    readonly lastMessageAt: Date,
    readonly unreadCount: number,
    readonly assignedUserId: string | null,
    readonly messages: InboxMessage[],
  ) {}
}
