export class LifeEvent {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string,
    readonly eventType: string,
    readonly name: string,
    readonly description: string | null,
    readonly happenedAt: string,
    readonly isYearlyRecurring: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    contactId: string
    eventType: string
    name: string
    description?: string
    happenedAt: string
    isYearlyRecurring?: boolean
  }): LifeEvent {
    return new LifeEvent(
      crypto.randomUUID(),
      props.tenantId,
      props.contactId,
      props.eventType,
      props.name,
      props.description ?? null,
      props.happenedAt,
      props.isYearlyRecurring ?? false,
      new Date(),
      new Date(),
    )
  }
}
