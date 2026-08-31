import { InboxChannel, InboxMessageStatus } from '@crm/contracts'

export class InboxMessage {
  constructor(
    readonly id: string,
    readonly conversationId: string,
    readonly channel: InboxChannel,
    readonly direction: 'INBOUND' | 'OUTBOUND',
    readonly senderName: string,
    readonly senderIdentifier: string,
    readonly recipientIdentifier: string,
    readonly bodyText: string,
    readonly bodyHtml: string | null,
    readonly status: InboxMessageStatus,
    readonly sentAt: Date,
  ) {}

  static create(props: {
    conversationId: string
    channel: InboxChannel
    direction: 'INBOUND' | 'OUTBOUND'
    senderName: string
    senderIdentifier: string
    recipientIdentifier: string
    bodyText: string
    bodyHtml?: string | null
    status?: InboxMessageStatus
  }): InboxMessage {
    return new InboxMessage(
      crypto.randomUUID(),
      props.conversationId,
      props.channel,
      props.direction,
      props.senderName,
      props.senderIdentifier,
      props.recipientIdentifier,
      props.bodyText,
      props.bodyHtml ?? null,
      props.status ?? 'DELIVERED',
      new Date(),
    )
  }
}
