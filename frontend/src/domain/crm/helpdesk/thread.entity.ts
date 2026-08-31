import { Entity } from "../common/entities/base.entity"

export interface ThreadProps {
  tenantId: string
  conversationId: string
  threadType: string
  bodyHtml: string | null
  bodyText: string | null
  createdByUserId: string | null
  createdByCustomerId: string | null
  isDraft: boolean
  messageIdHeader: string | null
  toAddresses: string | null
  ccAddresses: string | null
}

export class Thread extends Entity<ThreadProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get conversationId(): string {
    return this.props.conversationId
  }

  get threadType(): string {
    return this.props.threadType
  }

  get bodyHtml(): string | null {
    return this.props.bodyHtml
  }

  get bodyText(): string | null {
    return this.props.bodyText
  }

  get createdByUserId(): string | null {
    return this.props.createdByUserId
  }

  get createdByCustomerId(): string | null {
    return this.props.createdByCustomerId
  }

  get isDraft(): boolean {
    return this.props.isDraft
  }

  get messageIdHeader(): string | null {
    return this.props.messageIdHeader
  }

  get toAddresses(): string | null {
    return this.props.toAddresses
  }

  get ccAddresses(): string | null {
    return this.props.ccAddresses
  }

  static create(
    props: ThreadCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Thread {
    return new Thread(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      conversationId: props.conversationId,
      threadType: props.threadType,
      bodyHtml: props.bodyHtml ?? null,
      bodyText: props.bodyText ?? null,
      createdByUserId: props.createdByUserId ?? null,
      createdByCustomerId: props.createdByCustomerId ?? null,
      isDraft: props.isDraft ?? false,
      messageIdHeader: props.messageIdHeader ?? null,
      toAddresses: props.toAddresses ?? null,
      ccAddresses: props.ccAddresses ?? null,
    })
  }
}

export interface ThreadCreateInput {
  tenantId: string
  conversationId: string
  threadType: string
  bodyHtml?: string | null
  bodyText?: string | null
  createdByUserId?: string | null
  createdByCustomerId?: string | null
  isDraft?: boolean
  messageIdHeader?: string | null
  toAddresses?: string | null
  ccAddresses?: string | null
}
