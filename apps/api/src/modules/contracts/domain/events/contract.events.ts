import { DomainEvent } from '@crm/shared'

export class ContractCreatedEvent extends DomainEvent {
  readonly aggregateType = 'contract'
  readonly eventName = 'contract.created'

  constructor(readonly aggregateId: string, readonly name: string, readonly companyId: string) {
    super()
  }

  toPrimitives() {
    return { contractId: this.aggregateId, name: this.name, companyId: this.companyId }
  }
}

export class ContractRenewedEvent extends DomainEvent {
  readonly aggregateType = 'contract'
  readonly eventName = 'contract.renewed'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { contractId: this.aggregateId }
  }
}

export class ContractStatusChangedEvent extends DomainEvent {
  readonly aggregateType = 'contract'
  readonly eventName = 'contract.status_changed'

  constructor(readonly aggregateId: string, readonly oldStatus: string, readonly newStatus: string) {
    super()
  }

  toPrimitives() {
    return { contractId: this.aggregateId, oldStatus: this.oldStatus, newStatus: this.newStatus }
  }
}
