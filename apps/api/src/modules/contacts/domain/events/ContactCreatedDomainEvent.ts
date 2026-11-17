import { DomainEvent } from '@crm/shared'

export class ContactCreatedDomainEvent extends DomainEvent {
  readonly aggregateType = 'contact'
  readonly eventName = 'contact.created'

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
