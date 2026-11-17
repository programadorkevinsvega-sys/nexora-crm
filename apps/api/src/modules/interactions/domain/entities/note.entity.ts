export class Note {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string | null,
    readonly companyId: string | null,
    readonly dealId: string | null,
    readonly content: string,
    readonly authorUserId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    content: string
    authorUserId: string
    contactId?: string
    companyId?: string
    dealId?: string
  }): Note {
    return new Note(
      crypto.randomUUID(),
      props.tenantId,
      props.contactId ?? null,
      props.companyId ?? null,
      props.dealId ?? null,
      props.content,
      props.authorUserId,
      new Date(),
      new Date(),
    )
  }

  update(props: {
    content?: string
    contactId?: string | null
    companyId?: string | null
    dealId?: string | null
  }): Note {
    return new Note(
      this.id,
      this.tenantId,
      props.contactId !== undefined ? props.contactId : this.contactId,
      props.companyId !== undefined ? props.companyId : this.companyId,
      props.dealId !== undefined ? props.dealId : this.dealId,
      props.content ?? this.content,
      this.authorUserId,
      this.createdAt,
      new Date(),
    )
  }
}
