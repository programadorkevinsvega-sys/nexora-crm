import { DomainEvent } from '@crm/shared'

export class ContactDeletedDomainEvent extends DomainEvent {
  readonly aggregateType = 'contact'
  readonly eventName = 'contact.deleted'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives(): Record<string, unknown> {
    return {
      contactId: this.aggregateId,
    }
  }
}
