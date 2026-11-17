import { NotificationChannel, NotificationTemplate, Notification, NotificationLog, NotificationPreference } from '../domain/entities/notification.entity'

export class NotificationsMapper {
  static channelToDomain(r: any): NotificationChannel {
    return new NotificationChannel(r.id, r.tenantId, r.channelType, r.providerType,
      r.name, r.configJson ?? {}, r.isActive ?? true, r.createdAt, r.updatedAt)
  }
  static channelToResponse(c: NotificationChannel) {
    return { id: c.id, tenantId: c.tenantId, channelType: c.channelType, providerType: c.providerType,
      name: c.name, configJson: c.configJson, isActive: c.isActive,
      createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() }
  }

  static templateToDomain(r: any): NotificationTemplate {
    return new NotificationTemplate(r.id, r.tenantId, r.channelType, r.templateKey,
      r.subjectTemplate, r.bodyTemplate, r.variablesJson ?? [],
      r.locale ?? 'en', r.createdAt, r.updatedAt)
  }
  static templateToResponse(t: NotificationTemplate) {
    return { id: t.id, tenantId: t.tenantId, channelType: t.channelType, templateKey: t.templateKey,
      subjectTemplate: t.subjectTemplate, bodyTemplate: t.bodyTemplate,
      variables: t.variables, locale: t.locale,
      createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() }
  }

  static notificationToDomain(r: any): Notification {
    return new Notification(r.id, r.tenantId, r.channelType, r.channelId, r.templateId,
      r.toAddress, r.subject, r.body, r.variablesUsedJson ?? null,
      r.status ?? 'PENDING', r.priority ?? 0, r.attempts ?? 0, r.maxAttempts ?? 3,
      r.lastError, r.scheduledAt, r.sentAt, r.createdAt)
  }
  static notificationToResponse(n: Notification) {
    return { id: n.id, tenantId: n.tenantId, channelType: n.channelType, channelId: n.channelId,
      templateId: n.templateId, toAddress: n.toAddress, subject: n.subject, body: n.body,
      variablesUsed: n.variablesUsed, status: n.status, priority: n.priority,
      attempts: n.attempts, maxAttempts: n.maxAttempts, lastError: n.lastError,
      scheduledAt: n.scheduledAt?.toISOString() ?? null,
      sentAt: n.sentAt?.toISOString() ?? null, createdAt: n.createdAt.toISOString() }
  }

  static logToDomain(r: any): NotificationLog {
    return new NotificationLog(r.id, r.tenantId, r.queueId, r.channelType,
      r.toAddress, r.subject, r.bodyPreview, r.status,
      r.providerUsed, r.providerMessageId, r.errorMessage, r.sentAt)
  }
  static logToResponse(l: NotificationLog) {
    return { id: l.id, tenantId: l.tenantId, queueId: l.queueId, channelType: l.channelType,
      toAddress: l.toAddress, subject: l.subject, bodyPreview: l.bodyPreview,
      status: l.status, providerUsed: l.providerUsed, providerMessageId: l.providerMessageId,
      errorMessage: l.errorMessage, sentAt: l.sentAt.toISOString() }
  }

  static preferenceToDomain(r: any): NotificationPreference {
    return new NotificationPreference(r.id, r.tenantId, r.userId, r.channelType,
      r.isEnabled ?? true, r.createdAt, r.updatedAt)
  }
  static preferenceToResponse(p: NotificationPreference) {
    return { id: p.id, tenantId: p.tenantId, userId: p.userId, channelType: p.channelType,
      isEnabled: p.isEnabled, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() }
  }
}
