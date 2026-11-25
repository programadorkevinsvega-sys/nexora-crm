import { Injectable } from '@nestjs/common'
import { eq, and, or, gt, asc, lte, isNull, type SQL } from 'drizzle-orm'
import { getDb } from '@crm/database'
import {
  notificationChannels as channelsTable,
  notificationTemplates as templatesTable,
  notificationQueue as queueTable,
  notificationLogs as logsTable,
  notificationPreferences as prefsTable,
} from '@crm/database'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'
import { NotificationChannel, NotificationTemplate, Notification, NotificationLog, NotificationPreference } from '../domain/entities/notification.entity'
import { NotificationsMapper } from './notifications.mapper'

@Injectable()
export class DrizzleNotificationsRepository extends NotificationsRepository {
  private get db() { return getDb() }

  // ── Channels ──

  async findChannelById(id: string): Promise<NotificationChannel | null> {
    const row = await this.db.query.notificationChannels.findFirst({ where: eq(channelsTable.id, id) })
    return row ? NotificationsMapper.channelToDomain(row) : null
  }

  async listChannels(tenantId?: string): Promise<NotificationChannel[]> {
    const rows = await this.db.query.notificationChannels.findMany({
      where: tenantId ? eq(channelsTable.tenantId, tenantId) : undefined,
    })
    return rows.map(r => NotificationsMapper.channelToDomain(r))
  }

  async saveChannel(channel: NotificationChannel): Promise<void> {
    await this.db.insert(channelsTable).values({
      id: channel.id, tenantId: channel.tenantId, channelType: channel.channelType,
      providerType: channel.providerType, name: channel.name,
      configJson: channel.configJson, isActive: channel.isActive,
      createdAt: channel.createdAt, updatedAt: channel.updatedAt,
    }).onConflictDoUpdate({
      target: channelsTable.id, set: { name: channel.name, configJson: channel.configJson, isActive: channel.isActive, updatedAt: channel.updatedAt },
    })
  }

  async deleteChannel(id: string): Promise<void> {
    await this.db.delete(channelsTable).where(eq(channelsTable.id, id))
  }

  // ── Templates ──

  async findTemplateById(id: string): Promise<NotificationTemplate | null> {
    const row = await this.db.query.notificationTemplates.findFirst({ where: eq(templatesTable.id, id) })
    return row ? NotificationsMapper.templateToDomain(row) : null
  }

  async listTemplates(tenantId?: string): Promise<NotificationTemplate[]> {
    const rows = await this.db.query.notificationTemplates.findMany({
      where: tenantId ? eq(templatesTable.tenantId, tenantId) : undefined,
    })
    return rows.map(r => NotificationsMapper.templateToDomain(r))
  }

  async saveTemplate(template: NotificationTemplate): Promise<void> {
    await this.db.insert(templatesTable).values({
      id: template.id, tenantId: template.tenantId, channelType: template.channelType,
      templateKey: template.templateKey, subjectTemplate: template.subjectTemplate,
      bodyTemplate: template.bodyTemplate, variablesJson: template.variables,
      locale: template.locale, createdAt: template.createdAt, updatedAt: template.updatedAt,
    }).onConflictDoUpdate({
      target: templatesTable.id, set: { subjectTemplate: template.subjectTemplate, bodyTemplate: template.bodyTemplate, updatedAt: template.updatedAt },
    })
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.db.delete(templatesTable).where(eq(templatesTable.id, id))
  }

  // ── Notifications (queue) ──

  async findNotificationById(id: string): Promise<Notification | null> {
    const row = await this.db.query.notificationQueue.findFirst({ where: eq(queueTable.id, id) })
    return row ? NotificationsMapper.notificationToDomain(row) : null
  }

  async listNotifications(tenantId?: string, status?: string, channelType?: string, cursor?: string, limit = 20): Promise<{ data: Notification[]; nextCursor: string | null }> {
    const conditions: SQL[] = []
    if (tenantId) conditions.push(eq(queueTable.tenantId, tenantId))
    if (status) conditions.push(eq(queueTable.status, status))
    if (channelType) conditions.push(eq(queueTable.channelType, channelType))
    if (cursor) conditions.push(gt(queueTable.createdAt, new Date(cursor)))
    const rows = await this.db.query.notificationQueue.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      limit: limit + 1, orderBy: [asc(queueTable.createdAt)],
    })
    const hasMore = rows.length > limit
    return {
      data: (hasMore ? rows.slice(0, limit) : rows).map(r => NotificationsMapper.notificationToDomain(r)),
      nextCursor: hasMore ? rows[limit - 1].createdAt.toISOString() : null,
    }
  }

  async saveNotification(notification: Notification): Promise<void> {
    await this.db.insert(queueTable).values({
      id: notification.id, tenantId: notification.tenantId, channelType: notification.channelType,
      channelId: notification.channelId, templateId: notification.templateId,
      toAddress: notification.toAddress, subject: notification.subject,
      body: notification.body, variablesUsedJson: notification.variablesUsed,
      status: notification.status, priority: notification.priority,
      attempts: notification.attempts, maxAttempts: notification.maxAttempts,
      lastError: notification.lastError, scheduledAt: notification.scheduledAt,
      sentAt: notification.sentAt, createdAt: notification.createdAt,
    }).onConflictDoUpdate({
      target: queueTable.id, set: { status: notification.status, attempts: notification.attempts, lastError: notification.lastError, sentAt: notification.sentAt },
    })
  }

  async cancelNotification(id: string): Promise<void> {
    await this.db.update(queueTable).set({ status: 'CANCELLED' })
      .where(eq(queueTable.id, id))
  }

  async findPendingNotifications(limit = 50): Promise<Notification[]> {
    const rows = await this.db.query.notificationQueue.findMany({
      where: and(
        eq(queueTable.status, 'PENDING'),
        or(
          isNull(queueTable.scheduledAt),
          lte(queueTable.scheduledAt, new Date()),
        ),
      ),
      limit, orderBy: [asc(queueTable.priority), asc(queueTable.createdAt)],
    })
    return rows.map(r => NotificationsMapper.notificationToDomain(r))
  }

  // ── Logs ──

  async saveLog(log: NotificationLog): Promise<void> {
    await this.db.insert(logsTable).values({
      id: log.id, tenantId: log.tenantId, queueId: log.queueId, channelType: log.channelType,
      toAddress: log.toAddress, subject: log.subject, bodyPreview: log.bodyPreview,
      status: log.status, providerUsed: log.providerUsed,
      providerMessageId: log.providerMessageId, errorMessage: log.errorMessage,
      sentAt: log.sentAt,
    }).onConflictDoNothing()
  }

  async listLogs(tenantId?: string, channelType?: string, cursor?: string, limit = 20): Promise<{ data: NotificationLog[]; nextCursor: string | null }> {
    const conditions: any[] = []
    if (tenantId) conditions.push(eq(logsTable.tenantId, tenantId))
    if (channelType) conditions.push(eq(logsTable.channelType, channelType))
    if (cursor) conditions.push(gt(logsTable.sentAt, new Date(cursor)))
    const rows = await this.db.query.notificationLogs.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      limit: limit + 1, orderBy: [asc(logsTable.sentAt)],
    })
    const hasMore = rows.length > limit
    return {
      data: (hasMore ? rows.slice(0, limit) : rows).map(r => NotificationsMapper.logToDomain(r)),
      nextCursor: hasMore ? rows[limit - 1].sentAt.toISOString() : null,
    }
  }

  // ── Preferences ──

  async findPreference(userId: string, channelType: string, tenantId?: string): Promise<NotificationPreference | null> {
    const conditions: any[] = [eq(prefsTable.userId, userId), eq(prefsTable.channelType, channelType)]
    if (tenantId) conditions.push(eq(prefsTable.tenantId, tenantId))
    const row = await this.db.query.notificationPreferences.findFirst({ where: and(...conditions) })
    return row ? NotificationsMapper.preferenceToDomain(row) : null
  }

  async listPreferences(userId: string, tenantId?: string): Promise<NotificationPreference[]> {
    const conditions: any[] = [eq(prefsTable.userId, userId)]
    if (tenantId) conditions.push(eq(prefsTable.tenantId, tenantId))
    const rows = await this.db.query.notificationPreferences.findMany({ where: and(...conditions) })
    return rows.map(r => NotificationsMapper.preferenceToDomain(r))
  }

  async savePreference(pref: NotificationPreference): Promise<void> {
    await this.db.insert(prefsTable).values({
      id: pref.id, tenantId: pref.tenantId, userId: pref.userId, channelType: pref.channelType,
      isEnabled: pref.isEnabled, createdAt: pref.createdAt, updatedAt: pref.updatedAt,
    }).onConflictDoUpdate({
      target: prefsTable.id, set: { isEnabled: pref.isEnabled, updatedAt: pref.updatedAt },
    })
  }
}
