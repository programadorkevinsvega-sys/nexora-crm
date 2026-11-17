export class CustomerSegment {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly description: string | null,
    readonly isDynamic: boolean,
    readonly rulesJson: Record<string, unknown> | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    description?: string
    isDynamic?: boolean
    rulesJson?: Record<string, unknown>
  }): CustomerSegment {
    return new CustomerSegment(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.description ?? null,
      props.isDynamic ?? false,
      props.rulesJson ?? null,
      new Date(),
      new Date(),
    )
  }
}
