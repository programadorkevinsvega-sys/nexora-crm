export type AuthorType = 'CUSTOMER' | 'AGENT' | 'SYSTEM'

export class TicketReply {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly ticketId: string,
    readonly authorType: AuthorType,
    readonly authorId: string,
    readonly message: string,
    readonly isInternalNote: boolean,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    ticketId: string
    authorType: AuthorType
    authorId: string
    message: string
    isInternalNote?: boolean
  }): TicketReply {
    return new TicketReply(
      crypto.randomUUID(),
      props.tenantId,
      props.ticketId,
      props.authorType,
      props.authorId,
      props.message,
      props.isInternalNote ?? false,
      new Date(),
    )
  }
}
