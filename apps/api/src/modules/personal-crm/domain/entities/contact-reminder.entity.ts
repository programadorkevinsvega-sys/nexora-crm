export type FrequencyType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'

export class ContactReminder {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string,
    readonly title: string,
    readonly description: string | null,
    readonly frequencyType: FrequencyType,
    readonly frequencyInterval: number,
    readonly nextDueDate: Date,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    contactId: string
    title: string
    description?: string
    frequencyType: FrequencyType
    frequencyInterval?: number
    nextDueDate: Date | string
    isActive?: boolean
  }): ContactReminder {
    return new ContactReminder(
      crypto.randomUUID(),
      props.tenantId,
      props.contactId,
      props.title,
      props.description ?? null,
      props.frequencyType,
      props.frequencyInterval ?? 1,
      new Date(props.nextDueDate),
      props.isActive ?? true,
      new Date(),
      new Date(),
    )
  }

  toggle(): ContactReminder {
    return new ContactReminder(
      this.id,
      this.tenantId,
      this.contactId,
      this.title,
      this.description,
      this.frequencyType,
      this.frequencyInterval,
      this.nextDueDate,
      !this.isActive,
      this.createdAt,
      new Date(),
    )
  }
}
