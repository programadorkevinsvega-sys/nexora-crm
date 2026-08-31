import { DomainEvent } from '@crm/shared'

export class ContactUpdatedDomainEvent extends DomainEvent {
  readonly aggregateType = 'contact'
  readonly eventName = 'contact.updated'

  constructor(
    readonly aggregateId: string,
    readonly firstName: string,
    readonly lastName: string | null,
  ) {
    super()
  }

  toPrimitives(): Record<string, unknown> {
    return {
      contactId: this.aggregateId,
      firstName: this.firstName,
      lastName: this.lastName,
    }
  }
}
