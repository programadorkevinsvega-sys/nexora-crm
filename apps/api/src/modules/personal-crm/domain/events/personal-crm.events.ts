import { DomainEvent } from '@crm/shared'

export class LifeEventCreatedEvent extends DomainEvent {
  readonly aggregateType = 'life-event'
  readonly eventName = 'life_event.created'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly eventType: string,
    readonly name: string,
  ) {
    super()
  }

  toPrimitives() {
    return { lifeEventId: this.aggregateId, contactId: this.contactId, eventType: this.eventType, name: this.name }
  }
}

export class GiftGivenEvent extends DomainEvent {
  readonly aggregateType = 'gift'
  readonly eventName = 'gift.given'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly name: string,
  ) {
    super()
  }

  toPrimitives() {
    return { giftId: this.aggregateId, contactId: this.contactId, name: this.name }
  }
}

export class DebtRecordedEvent extends DomainEvent {
  readonly aggregateType = 'debt'
  readonly eventName = 'debt.recorded'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly direction: string,
    readonly amount: number,
  ) {
    super()
  }

  toPrimitives() {
    return { debtId: this.aggregateId, contactId: this.contactId, direction: this.direction, amount: this.amount }
  }
}

export class DebtSettledEvent extends DomainEvent {
  readonly aggregateType = 'debt'
  readonly eventName = 'debt.settled'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly amount: number,
  ) {
    super()
  }

  toPrimitives() {
    return { debtId: this.aggregateId, contactId: this.contactId, amount: this.amount }
  }
}

export class ReminderCreatedEvent extends DomainEvent {
  readonly aggregateType = 'reminder'
  readonly eventName = 'reminder.created'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly title: string,
  ) {
    super()
  }

  toPrimitives() {
    return { reminderId: this.aggregateId, contactId: this.contactId, title: this.title }
  }
}

export class PetAddedEvent extends DomainEvent {
  readonly aggregateType = 'pet'
  readonly eventName = 'pet.added'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly petCategory: string,
    readonly name: string,
  ) {
    super()
  }

  toPrimitives() {
    return { petId: this.aggregateId, contactId: this.contactId, petCategory: this.petCategory, name: this.name }
  }
}
