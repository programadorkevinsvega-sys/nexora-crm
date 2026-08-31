import { DomainEvent } from '@crm/shared'

export class PipelineCreatedEvent extends DomainEvent {
  readonly aggregateType = 'pipeline'
  readonly eventName = 'pipeline.created'

  constructor(readonly aggregateId: string, readonly name: string) {
    super()
  }

  toPrimitives() {
    return { pipelineId: this.aggregateId, name: this.name }
  }
}

export class PipelineDeletedEvent extends DomainEvent {
  readonly aggregateType = 'pipeline'
  readonly eventName = 'pipeline.deleted'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { pipelineId: this.aggregateId }
  }
}

export class DealCreatedEvent extends DomainEvent {
  readonly aggregateType = 'deal'
  readonly eventName = 'deal.created'

  constructor(readonly aggregateId: string, readonly name: string, readonly amount: number) {
    super()
  }

  toPrimitives() {
    return { dealId: this.aggregateId, name: this.name, amount: this.amount }
  }
}

export class DealUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'deal'
  readonly eventName = 'deal.updated'

  constructor(readonly aggregateId: string, readonly name: string, readonly amount: number) {
    super()
  }

  toPrimitives() {
    return { dealId: this.aggregateId, name: this.name, amount: this.amount }
  }
}

export class DealMovedEvent extends DomainEvent {
  readonly aggregateType = 'deal'
  readonly eventName = 'deal.moved'

  constructor(readonly aggregateId: string, readonly fromStageId: string, readonly toStageId: string) {
    super()
  }

  toPrimitives() {
    return { dealId: this.aggregateId, fromStageId: this.fromStageId, toStageId: this.toStageId }
  }
}

export class DealWonEvent extends DomainEvent {
  readonly aggregateType = 'deal'
  readonly eventName = 'deal.won'

  constructor(readonly aggregateId: string, readonly amount: number) {
    super()
  }

  toPrimitives() {
    return { dealId: this.aggregateId, amount: this.amount }
  }
}

export class DealLostEvent extends DomainEvent {
  readonly aggregateType = 'deal'
  readonly eventName = 'deal.lost'

  constructor(readonly aggregateId: string, readonly reasonId: string | null) {
    super()
  }

  toPrimitives() {
    return { dealId: this.aggregateId, reasonId: this.reasonId }
  }
}
