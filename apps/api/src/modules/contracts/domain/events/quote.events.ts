import { DomainEvent } from '@crm/shared'

export class QuoteCreatedEvent extends DomainEvent {
  readonly aggregateType = 'quote'
  readonly eventName = 'quote.created'

  constructor(readonly aggregateId: string, readonly quoteNumber: string, readonly dealId: string | null) {
    super()
  }

  toPrimitives() {
    return { quoteId: this.aggregateId, quoteNumber: this.quoteNumber, dealId: this.dealId }
  }
}

export class QuoteSentEvent extends DomainEvent {
  readonly aggregateType = 'quote'
  readonly eventName = 'quote.sent'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { quoteId: this.aggregateId }
  }
}

export class QuoteAcceptedEvent extends DomainEvent {
  readonly aggregateType = 'quote'
  readonly eventName = 'quote.accepted'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { quoteId: this.aggregateId }
  }
}

export class QuoteRejectedEvent extends DomainEvent {
  readonly aggregateType = 'quote'
  readonly eventName = 'quote.rejected'

  constructor(readonly aggregateId: string, readonly reason: string) {
    super()
  }

  toPrimitives() {
    return { quoteId: this.aggregateId, reason: this.reason }
  }
}
