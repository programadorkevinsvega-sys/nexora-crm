export type CallType = 'INBOUND' | 'OUTBOUND' | 'MEETING'

export class Call {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string | null,
    readonly callType: CallType,
    readonly durationSeconds: number | null,
    readonly summary: string | null,
    readonly happenedAt: Date,
    readonly authorUserId: string,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    callType: CallType
    happenedAt: Date
    authorUserId: string
    contactId?: string
    durationSeconds?: number
    summary?: string
  }): Call {
    return new Call(
      crypto.randomUUID(),
      props.tenantId,
      props.contactId ?? null,
      props.callType,
      props.durationSeconds ?? null,
      props.summary ?? null,
      props.happenedAt,
      props.authorUserId,
      new Date(),
    )
  }
}
