import { DomainEvent } from '@crm/shared'

export class SalesTeamCreatedEvent extends DomainEvent {
  readonly aggregateType = 'sales-team'

  constructor(
    readonly aggregateId: string,
    readonly name: string,
    readonly managerUserId: string | null,
    readonly monthlyTarget: number | null,
  ) {
    super()
  }

  get eventName(): string {
    return 'sales-team.created'
  }

  toPrimitives() {
    return {
      teamId: this.aggregateId,
      name: this.name,
      managerUserId: this.managerUserId,
      monthlyTarget: this.monthlyTarget,
    }
  }
}

export class SalesTeamUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'sales-team'

  constructor(
    readonly aggregateId: string,
    readonly name: string,
  ) {
    super()
  }

  get eventName(): string {
    return 'sales-team.updated'
  }

  toPrimitives() {
    return { teamId: this.aggregateId, name: this.name }
  }
}

export class SalesTeamDeletedEvent extends DomainEvent {
  readonly aggregateType = 'sales-team'

  constructor(readonly aggregateId: string) {
    super()
  }

  get eventName(): string {
    return 'sales-team.deleted'
  }

  toPrimitives() {
    return { teamId: this.aggregateId }
  }
}

export class TeamMemberAddedEvent extends DomainEvent {
  readonly aggregateType = 'sales-team'

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
  ) {
    super()
  }

  get eventName(): string {
    return 'sales-team.member-added'
  }

  toPrimitives() {
    return { teamId: this.aggregateId, userId: this.userId }
  }
}

export class TeamMemberRemovedEvent extends DomainEvent {
  readonly aggregateType = 'sales-team'

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
  ) {
    super()
  }

  get eventName(): string {
    return 'sales-team.member-removed'
  }

  toPrimitives() {
    return { teamId: this.aggregateId, userId: this.userId }
  }
}

export class QuotaAssignedEvent extends DomainEvent {
  readonly aggregateType = 'sales-quota'

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    readonly teamId: string | null,
    readonly periodMonth: number,
    readonly periodYear: number,
    readonly targetAmount: number,
  ) {
    super()
  }

  get eventName(): string {
    return 'sales-quota.assigned'
  }

  toPrimitives() {
    return {
      quotaId: this.aggregateId,
      userId: this.userId,
      teamId: this.teamId,
      periodMonth: this.periodMonth,
      periodYear: this.periodYear,
      targetAmount: this.targetAmount,
    }
  }
}

export class QuotaAchievedUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'sales-quota'

  constructor(
    readonly aggregateId: string,
    readonly achievedAmount: number,
  ) {
    super()
  }

  get eventName(): string {
    return 'sales-quota.achieved-updated'
  }

  toPrimitives() {
    return { quotaId: this.aggregateId, achievedAmount: this.achievedAmount }
  }
}
