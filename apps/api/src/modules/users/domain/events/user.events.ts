import { DomainEvent } from '@crm/shared'

export class UserCreatedEvent extends DomainEvent {
  readonly aggregateType = 'user'

  constructor(
    readonly aggregateId: string,
    readonly eventName: string,
    readonly tenantId: string,
    readonly email: string,
    readonly profileType: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      userId: this.aggregateId,
      tenantId: this.tenantId,
      email: this.email,
      profileType: this.profileType,
    }
  }
}

export class UserUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'user'
  readonly eventName = 'user.updated'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId }
  }
}

export class UserDeletedEvent extends DomainEvent {
  readonly aggregateType = 'user'
  readonly eventName = 'user.deleted'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId }
  }
}

export class UserProfileUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'user'

  constructor(
    readonly aggregateId: string,
    readonly eventName: string,
  ) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId }
  }
}

export class UserOAuthLinkedEvent extends DomainEvent {
  readonly aggregateType = 'user'
  readonly eventName = 'user.oauth.linked'

  constructor(
    readonly aggregateId: string,
    readonly providerName: string,
  ) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId, provider: this.providerName }
  }
}

export class UserOAuthUnlinkedEvent extends DomainEvent {
  readonly aggregateType = 'user'
  readonly eventName = 'user.oauth.unlinked'

  constructor(
    readonly aggregateId: string,
    readonly providerName: string,
  ) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId, provider: this.providerName }
  }
}

export class UserDeviceRegisteredEvent extends DomainEvent {
  readonly aggregateType = 'user'
  readonly eventName = 'user.device.registered'

  constructor(
    readonly aggregateId: string,
    readonly deviceId: string,
    readonly platform: string,
  ) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId, deviceId: this.deviceId, platform: this.platform }
  }
}

export class UserDeviceRemovedEvent extends DomainEvent {
  readonly aggregateType = 'user'
  readonly eventName = 'user.device.removed'

  constructor(
    readonly aggregateId: string,
    readonly deviceId: string,
  ) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId, deviceId: this.deviceId }
  }
}
