import {
  notificationChannels,
  notificationTemplates,
  notificationQueue,
  notificationLogs,
  notificationPreferences,
} from '@crm/database'
import {
  NotificationChannel, NotificationTemplate, Notification, NotificationLog, NotificationPreference,
  type ChannelType, type ProviderType, type NotificationStatus,
} from '../domain/entities/notification.entity'

const CHANNEL_TYPES = new Set<ChannelType>(['EMAIL', 'PUSH', 'SLACK', 'WEBSOCKET', 'SMS'])
const PROVIDER_TYPES = new Set<ProviderType>(['SES', 'RESEND', 'SMTP', 'FCM', 'SLACK_WEBHOOK', 'CUSTOM'])
const NOTIFICATION_STATUSES = new Set<NotificationStatus>(['PENDING', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED'])

function asJsonObject(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function asJsonObjectOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item): item is string => typeof item === 'string')
    ? value
    : []
}

function channelType(value: string): ChannelType {
  if (CHANNEL_TYPES.has(value as ChannelType)) return value as ChannelType
  throw new TypeError(`Unsupported notification channel type: ${value}`)
}

function providerType(value: string): ProviderType {
  if (PROVIDER_TYPES.has(value as ProviderType)) return value as ProviderType
  throw new TypeError(`Unsupported notification provider type: ${value}`)
}

function notificationStatus(value: string): NotificationStatus {
  if (NOTIFICATION_STATUSES.has(value as NotificationStatus)) return value as NotificationStatus
  throw new TypeError(`Unsupported notification status: ${value}`)
}

export class NotificationsMapper {
  static channelToDomain(row: typeof notificationChannels.$inferSelect): NotificationChannel {
    return new NotificationChannel(
      row.id, row.tenantId, channelType(row.channelType), providerType(row.providerType),
      row.name, asJsonObject(row.configJson), row.isActive ?? true, row.createdAt, row.updatedAt,
    )
  }
  static channelToResponse(channel: NotificationChannel) {
    return { id: channel.id, tenantId: channel.tenantId, channelType: channel.channelType, providerType: channel.providerType,
      name: channel.name, configJson: channel.configJson, isActive: channel.isActive,
      createdAt: channel.createdAt.toISOString(), updatedAt: channel.updatedAt.toISOString() }
  }

  static templateToDomain(row: typeof notificationTemplates.$inferSelect): NotificationTemplate {
    return new NotificationTemplate(
      row.id, row.tenantId, channelType(row.channelType), row.templateKey,
      row.subjectTemplate, row.bodyTemplate, asStringArray(row.variablesJson),
      row.locale ?? 'en', row.createdAt, row.updatedAt,
    )
  }
  static templateToResponse(template: NotificationTemplate) {
    return { id: template.id, tenantId: template.tenantId, channelType: template.channelType, templateKey: template.templateKey,
      subjectTemplate: template.subjectTemplate, bodyTemplate: template.bodyTemplate,
      variables: template.variables, locale: template.locale,
      createdAt: template.createdAt.toISOString(), updatedAt: template.updatedAt.toISOString() }
  }

  static notificationToDomain(row: typeof notificationQueue.$inferSelect): Notification {
    return new Notification(
      row.id, row.tenantId, channelType(row.channelType), row.channelId, row.templateId,
      row.toAddress, row.subject, row.body, asJsonObjectOrNull(row.variablesUsedJson),
      notificationStatus(row.status), row.priority ?? 0, row.attempts, row.maxAttempts ?? 3,
      row.lastError, row.scheduledAt, row.sentAt, row.createdAt,
    )
  }
  static notificationToResponse(notification: Notification) {
    return { id: notification.id, tenantId: notification.tenantId, channelType: notification.channelType, channelId: notification.channelId,
      templateId: notification.templateId, toAddress: notification.toAddress, subject: notification.subject, body: notification.body,
      variablesUsed: notification.variablesUsed, status: notification.status, priority: notification.priority,
      attempts: notification.attempts, maxAttempts: notification.maxAttempts, lastError: notification.lastError,
      scheduledAt: notification.scheduledAt?.toISOString() ?? null,
      sentAt: notification.sentAt?.toISOString() ?? null, createdAt: notification.createdAt.toISOString() }
  }

  static logToDomain(row: typeof notificationLogs.$inferSelect): NotificationLog {
    return new NotificationLog(
      row.id, row.tenantId, row.queueId, channelType(row.channelType),
      row.toAddress, row.subject, row.bodyPreview, row.status,
      row.providerUsed, row.providerMessageId, row.errorMessage, row.sentAt,
    )
  }
  static logToResponse(log: NotificationLog) {
    return { id: log.id, tenantId: log.tenantId, queueId: log.queueId, channelType: log.channelType,
      toAddress: log.toAddress, subject: log.subject, bodyPreview: log.bodyPreview,
      status: log.status, providerUsed: log.providerUsed, providerMessageId: log.providerMessageId,
      errorMessage: log.errorMessage, sentAt: log.sentAt.toISOString() }
  }

  static preferenceToDomain(row: typeof notificationPreferences.$inferSelect): NotificationPreference {
    return new NotificationPreference(
      row.id, row.tenantId, row.userId, channelType(row.channelType),
      row.isEnabled ?? true, row.createdAt, row.updatedAt,
    )
  }
  static preferenceToResponse(preference: NotificationPreference) {
    return { id: preference.id, tenantId: preference.tenantId, userId: preference.userId, channelType: preference.channelType,
      isEnabled: preference.isEnabled, createdAt: preference.createdAt.toISOString(), updatedAt: preference.updatedAt.toISOString() }
  }
}