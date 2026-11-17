import { DomainEvent } from '@crm/shared'

export class CompanyCreatedEvent extends DomainEvent {
  readonly aggregateType = 'company'
  readonly eventName = 'company.created'

  constructor(readonly aggregateId: string, readonly name: string) {
    super()
  }

  toPrimitives() {
    return { companyId: this.aggregateId, name: this.name }
  }
}

export class CompanyUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'company'
  readonly eventName = 'company.updated'

  constructor(readonly aggregateId: string, readonly name: string) {
    super()
  }

  toPrimitives() {
    return { companyId: this.aggregateId, name: this.name }
  }
}

export class CompanyDeletedEvent extends DomainEvent {
  readonly aggregateType = 'company'
  readonly eventName = 'company.deleted'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { companyId: this.aggregateId }
  }
}
