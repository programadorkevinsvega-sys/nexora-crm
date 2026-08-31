import { Entity } from "../common/entities/base.entity"

export interface TicketReplyProps {
  tenantId: string
  ticketId: string
  authorType: "CUSTOMER" | "AGENT" | "SYSTEM"
  authorId: string
  message: string
  isInternalNote: boolean
}

export class TicketReply extends Entity<TicketReplyProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get ticketId(): string {
    return this.props.ticketId
  }

  get authorType(): "CUSTOMER" | "AGENT" | "SYSTEM" {
    return this.props.authorType
  }

  get authorId(): string {
    return this.props.authorId
  }

  get message(): string {
    return this.props.message
  }

  get isInternalNote(): boolean {
    return this.props.isInternalNote
  }

  static create(
    props: TicketReplyCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): TicketReply {
    return new TicketReply(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      ticketId: props.ticketId,
      authorType: props.authorType,
      authorId: props.authorId,
      message: props.message,
      isInternalNote: props.isInternalNote ?? false,
    })
  }
}

export interface TicketReplyCreateInput {
  tenantId: string
  ticketId: string
  authorType: "CUSTOMER" | "AGENT" | "SYSTEM"
  authorId: string
  message: string
  isInternalNote?: boolean
}
