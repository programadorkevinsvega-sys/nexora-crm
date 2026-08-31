import { DomainEvent } from '@crm/shared'

export class UserLoggedInEvent extends DomainEvent {
  readonly aggregateType = 'auth'
  readonly eventName = 'auth.user.logged_in'

  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly sessionId: string,
  ) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId, tenantId: this.tenantId, sessionId: this.sessionId }
  }
}

export class UserLoggedOutEvent extends DomainEvent {
  readonly aggregateType = 'auth'
  readonly eventName = 'auth.user.logged_out'

  constructor(
    readonly aggregateId: string,
    readonly sessionId: string,
  ) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId, sessionId: this.sessionId }
  }
}

export class SessionRevokedEvent extends DomainEvent {
  readonly aggregateType = 'auth'
  readonly eventName = 'auth.session.revoked'

  constructor(
    readonly aggregateId: string,
    readonly sessionId: string,
  ) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId, sessionId: this.sessionId }
  }
}

export class PasswordChangedEvent extends DomainEvent {
  readonly aggregateType = 'auth'
  readonly eventName = 'auth.password.changed'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId }
  }
}

export class MfaSetupEvent extends DomainEvent {
  readonly aggregateType = 'auth'
  readonly eventName = 'auth.mfa.setup'

  constructor(
    readonly aggregateId: string,
    readonly mfaType: string,
  ) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId, type: this.mfaType }
  }
}

export class MfaVerifiedEvent extends DomainEvent {
  readonly aggregateType = 'auth'
  readonly eventName = 'auth.mfa.verified'

  constructor(
    readonly aggregateId: string,
    readonly methodId: string,
  ) {
    super()
  }

  toPrimitives() {
    return { userId: this.aggregateId, methodId: this.methodId }
  }
}
