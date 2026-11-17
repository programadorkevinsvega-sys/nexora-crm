import { randomUUID } from 'crypto'

export type ChannelType = 'EMAIL' | 'PUSH' | 'SLACK' | 'WEBSOCKET' | 'SMS'
export type ProviderType = 'SES' | 'RESEND' | 'SMTP' | 'FCM' | 'SLACK_WEBHOOK' | 'CUSTOM'
export type NotificationStatus = 'PENDING' | 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED'

export class NotificationChannel {
  constructor(
    readonly id: string, readonly tenantId: string | null,
    readonly channelType: ChannelType, readonly providerType: ProviderType,
    readonly name: string, readonly configJson: Record<string, unknown>,
    readonly isActive: boolean, readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    tenantId?: string; channelType: ChannelType; providerType: ProviderType
    name: string; configJson?: Record<string, unknown>
  }): NotificationChannel {
    return new NotificationChannel(randomUUID(), props.tenantId ?? null, props.channelType,
      props.providerType, props.name, props.configJson ?? {}, true, new Date(), new Date())
  }
}

export class NotificationTemplate {
  constructor(
    readonly id: string, readonly tenantId: string | null,
    readonly channelType: ChannelType, readonly templateKey: string,
    readonly subjectTemplate: string, readonly bodyTemplate: string,
    readonly variables: string[], readonly locale: string,
    readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    tenantId?: string; channelType: ChannelType; templateKey: string
    subjectTemplate: string; bodyTemplate: string; variables?: string[]; locale?: string
  }): NotificationTemplate {
    return new NotificationTemplate(randomUUID(), props.tenantId ?? null,
      props.channelType, props.templateKey, props.subjectTemplate, props.bodyTemplate,
      props.variables ?? [], props.locale ?? 'en', new Date(), new Date())
  }
}

export class Notification {
  constructor(
    readonly id: string, readonly tenantId: string | null,
    readonly channelType: ChannelType,
    readonly channelId: string | null, readonly templateId: string | null,
    readonly toAddress: string, readonly subject: string | null,
    readonly body: string | null,
    readonly variablesUsed: Record<string, unknown> | null,
    readonly status: NotificationStatus, readonly priority: number,
    readonly attempts: number, readonly maxAttempts: number,
    readonly lastError: string | null,
    readonly scheduledAt: Date | null, readonly sentAt: Date | null,
    readonly createdAt: Date,
  ) {}
  static create(props: {
    tenantId?: string; channelType: ChannelType; channelId?: string
    templateId?: string; toAddress: string; subject?: string; body?: string
    variables?: Record<string, unknown>; priority?: number; scheduledAt?: Date
  }): Notification {
    return new Notification(randomUUID(), props.tenantId ?? null,
      props.channelType, props.channelId ?? null, props.templateId ?? null,
      props.toAddress, props.subject ?? null, props.body ?? null,
      props.variables ?? null, 'PENDING', props.priority ?? 0,
      0, 3, null, props.scheduledAt ?? null, null, new Date())
  }
  markSent(_providerMessageId?: string): Notification {
    return new Notification(this.id, this.tenantId, this.channelType,
      this.channelId, this.templateId, this.toAddress, this.subject, this.body,
      this.variablesUsed, 'SENT', this.priority, this.attempts, this.maxAttempts,
      null, this.scheduledAt, new Date(), this.createdAt)
  }
  markFailed(error: string): Notification {
    return new Notification(this.id, this.tenantId, this.channelType,
      this.channelId, this.templateId, this.toAddress, this.subject, this.body,
      this.variablesUsed, 'FAILED', this.priority, this.attempts + 1, this.maxAttempts,
      error, this.scheduledAt, null, this.createdAt)
  }
}

export class NotificationLog {
  constructor(
    readonly id: string, readonly tenantId: string | null,
    readonly queueId: string | null, readonly channelType: ChannelType,
    readonly toAddress: string, readonly subject: string | null,
    readonly bodyPreview: string | null, readonly status: string,
    readonly providerUsed: string | null, readonly providerMessageId: string | null,
    readonly errorMessage: string | null, readonly sentAt: Date,
  ) {}
}

export class NotificationPreference {
  constructor(
    readonly id: string, readonly tenantId: string | null,
    readonly userId: string, readonly channelType: ChannelType,
    readonly isEnabled: boolean, readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    tenantId?: string; userId: string; channelType: ChannelType; isEnabled?: boolean
  }): NotificationPreference {
    return new NotificationPreference(randomUUID(), props.tenantId ?? null,
      props.userId, props.channelType, props.isEnabled ?? true, new Date(), new Date())
  }
}
