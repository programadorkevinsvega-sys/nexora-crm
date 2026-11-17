export class HelpdeskThread {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly conversationId: string,
    readonly threadType: string,
    readonly bodyHtml: string | null,
    readonly bodyText: string | null,
    readonly createdByUserId: string | null,
    readonly createdByCustomerId: string | null,
    readonly isDraft: boolean,
    readonly messageIdHeader: string | null,
    readonly toAddresses: string | null,
    readonly ccAddresses: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    conversationId: string
    threadType: string
    bodyHtml?: string
    bodyText?: string
    createdByUserId?: string
    createdByCustomerId?: string
    isDraft?: boolean
    messageIdHeader?: string
    toAddresses?: string
    ccAddresses?: string
  }): HelpdeskThread {
    return new HelpdeskThread(
      crypto.randomUUID(),
      props.tenantId,
      props.conversationId,
      props.threadType,
      props.bodyHtml ?? null,
      props.bodyText ?? null,
      props.createdByUserId ?? null,
      props.createdByCustomerId ?? null,
      props.isDraft ?? false,
      props.messageIdHeader ?? null,
      props.toAddresses ?? null,
      props.ccAddresses ?? null,
      new Date(),
      new Date(),
    )
  }
}
