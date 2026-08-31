import { DomainEvent } from '@crm/shared'

export class NotificationEnqueuedEvent extends DomainEvent {
  readonly aggregateType = 'notification'
  readonly eventName = 'notification.enqueued'
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string | null,
    readonly channelType: string,
    readonly toAddress: string,
    readonly subject: string | null,
  ) { super() }
  toPrimitives() {
    return { tenantId: this.tenantId, channelType: this.channelType, toAddress: this.toAddress, subject: this.subject }
  }
}

export class NotificationSentEvent extends DomainEvent {
  readonly aggregateType = 'notification'
  readonly eventName = 'notification.sent'
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string | null,
    readonly providerMessageId: string | null,
    readonly channelType: string,
    readonly toAddress: string,
  ) { super() }
  toPrimitives() {
    return { tenantId: this.tenantId, providerMessageId: this.providerMessageId, channelType: this.channelType, toAddress: this.toAddress }
  }
}

export class NotificationFailedEvent extends DomainEvent {
  readonly aggregateType = 'notification'
  readonly eventName = 'notification.failed'
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string | null,
    readonly error: string,
    readonly channelType: string,
    readonly toAddress: string,
  ) { super() }
  toPrimitives() {
    return { tenantId: this.tenantId, error: this.error, channelType: this.channelType, toAddress: this.toAddress }
  }
}

export class ChannelCreatedEvent extends DomainEvent {
  readonly aggregateType = 'notification_channel'
  readonly eventName = 'notification_channel.created'
  constructor(
    readonly aggregateId: string, readonly tenantId: string | null, readonly channelType: string, readonly providerType: string,
  ) { super() }
  toPrimitives() { return { tenantId: this.tenantId, channelType: this.channelType, providerType: this.providerType } }
}
