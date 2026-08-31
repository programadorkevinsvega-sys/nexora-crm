import { NotificationChannel, NotificationTemplate, Notification, NotificationLog, NotificationPreference } from '../entities/notification.entity'

export abstract class NotificationsRepository {
  // Channels
  abstract findChannelById(id: string): Promise<NotificationChannel | null>
  abstract listChannels(tenantId?: string): Promise<NotificationChannel[]>
  abstract saveChannel(channel: NotificationChannel): Promise<void>
  abstract deleteChannel(id: string): Promise<void>

  // Templates
  abstract findTemplateById(id: string): Promise<NotificationTemplate | null>
  abstract listTemplates(tenantId?: string): Promise<NotificationTemplate[]>
  abstract saveTemplate(template: NotificationTemplate): Promise<void>
  abstract deleteTemplate(id: string): Promise<void>

  // Notifications (queue)
  abstract findNotificationById(id: string): Promise<Notification | null>
  abstract listNotifications(tenantId?: string, status?: string, channelType?: string, cursor?: string, limit?: number): Promise<{ data: Notification[]; nextCursor: string | null }>
  abstract saveNotification(notification: Notification): Promise<void>
  abstract cancelNotification(id: string): Promise<void>
  abstract findPendingNotifications(limit?: number): Promise<Notification[]>

  // Logs
  abstract saveLog(log: NotificationLog): Promise<void>
  abstract listLogs(tenantId?: string, channelType?: string, cursor?: string, limit?: number): Promise<{ data: NotificationLog[]; nextCursor: string | null }>

  // Preferences
  abstract findPreference(userId: string, channelType: string, tenantId?: string): Promise<NotificationPreference | null>
  abstract listPreferences(userId: string, tenantId?: string): Promise<NotificationPreference[]>
  abstract savePreference(pref: NotificationPreference): Promise<void>
}
