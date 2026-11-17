import { DomainEvent } from '@crm/shared'

export class PointsEarnedEvent extends DomainEvent {
  readonly aggregateType = 'loyalty'
  readonly eventName = 'loyalty.points.earned'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly points: number,
    readonly newBalance: number,
  ) {
    super()
  }

  toPrimitives() {
    return { profileId: this.aggregateId, contactId: this.contactId, points: this.points, newBalance: this.newBalance }
  }
}

export class PointsRedeemedEvent extends DomainEvent {
  readonly aggregateType = 'loyalty'
  readonly eventName = 'loyalty.points.redeemed'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly points: number,
    readonly newBalance: number,
  ) {
    super()
  }

  toPrimitives() {
    return { profileId: this.aggregateId, contactId: this.contactId, points: this.points, newBalance: this.newBalance }
  }
}

export class TierChangedEvent extends DomainEvent {
  readonly aggregateType = 'loyalty'
  readonly eventName = 'loyalty.tier.changed'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly previousTier: string,
    readonly newTier: string,
  ) {
    super()
  }

  toPrimitives() {
    return { profileId: this.aggregateId, contactId: this.contactId, previousTier: this.previousTier, newTier: this.newTier }
  }
}
