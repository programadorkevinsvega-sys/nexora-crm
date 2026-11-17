export class HelpdeskMailbox {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly emailAddress: string,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    emailAddress: string
    isActive?: boolean
  }): HelpdeskMailbox {
    return new HelpdeskMailbox(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.emailAddress,
      props.isActive ?? true,
      new Date(),
      new Date(),
    )
  }

  deactivate(): HelpdeskMailbox {
    return new HelpdeskMailbox(
      this.id,
      this.tenantId,
      this.name,
      this.emailAddress,
      false,
      this.createdAt,
      new Date(),
    )
  }

  activate(): HelpdeskMailbox {
    return new HelpdeskMailbox(
      this.id,
      this.tenantId,
      this.name,
      this.emailAddress,
      true,
      this.createdAt,
      new Date(),
    )
  }
}
