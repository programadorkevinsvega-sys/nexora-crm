import { DomainEvent } from '@crm/shared'

export class CampaignCreatedEvent extends DomainEvent {
  readonly aggregateType = 'campaign'
  readonly eventName = 'campaign.created'

  constructor(readonly aggregateId: string, readonly name: string) {
    super()
  }

  toPrimitives() {
    return { campaignId: this.aggregateId, name: this.name }
  }
}

export class CampaignUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'campaign'
  readonly eventName = 'campaign.updated'

  constructor(readonly aggregateId: string, readonly name: string) {
    super()
  }

  toPrimitives() {
    return { campaignId: this.aggregateId, name: this.name }
  }
}

export class CampaignStatusChangedEvent extends DomainEvent {
  readonly aggregateType = 'campaign'
  readonly eventName = 'campaign.status.changed'

  constructor(
    readonly aggregateId: string,
    readonly previousStatus: string,
    readonly newStatus: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      campaignId: this.aggregateId,
      previousStatus: this.previousStatus,
      newStatus: this.newStatus,
    }
  }
}

export class CampaignMemberAddedEvent extends DomainEvent {
  readonly aggregateType = 'campaign'
  readonly eventName = 'campaign.member.added'

  constructor(
    readonly aggregateId: string,
    readonly memberId: string,
    readonly contactId: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      campaignId: this.aggregateId,
      memberId: this.memberId,
      contactId: this.contactId,
    }
  }
}

export class CampaignMemberStatusChangedEvent extends DomainEvent {
  readonly aggregateType = 'campaign'
  readonly eventName = 'campaign.member.status.changed'

  constructor(
    readonly aggregateId: string,
    readonly memberId: string,
    readonly previousStatus: string,
    readonly newStatus: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      campaignId: this.aggregateId,
      memberId: this.memberId,
      previousStatus: this.previousStatus,
      newStatus: this.newStatus,
    }
  }
}
