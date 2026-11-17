import { DomainEvent } from '@crm/shared'
import { LeadTemperature } from '@crm/contracts'

export class LeadScoreUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'lead_score'
  readonly eventName = 'crm.lead.score_updated'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly newScore: number,
    readonly temperature: LeadTemperature,
  ) {
    super()
  }

  toPrimitives() {
    return {
      id: this.aggregateId,
      contactId: this.contactId,
      score: this.newScore,
      temperature: this.temperature,
    }
  }
}

export class LeadTemperatureChangedEvent extends DomainEvent {
  readonly aggregateType = 'lead_score'
  readonly eventName = 'crm.lead.temperature_changed'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly previousTemperature: LeadTemperature,
    readonly newTemperature: LeadTemperature,
    readonly score: number,
  ) {
    super()
  }

  toPrimitives() {
    return {
      id: this.aggregateId,
      contactId: this.contactId,
      previousTemperature: this.previousTemperature,
      newTemperature: this.newTemperature,
      score: this.score,
    }
  }
}

export class LeadScoreThresholdReachedEvent extends DomainEvent {
  readonly aggregateType = 'lead_score'
  readonly eventName = 'crm.lead.score_threshold_reached'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly score: number,
    readonly threshold: number,
  ) {
    super()
  }

  toPrimitives() {
    return {
      id: this.aggregateId,
      contactId: this.contactId,
      score: this.score,
      threshold: this.threshold,
    }
  }
}
