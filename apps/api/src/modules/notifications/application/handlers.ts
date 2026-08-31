import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'
import {
  NotificationChannel, NotificationTemplate, Notification, NotificationLog, NotificationPreference,
  ChannelType, ProviderType,
} from '../domain/entities/notification.entity'
import { OutboxService } from '../../../common/outbox/outbox.service'
import { NotificationEnqueuedEvent, NotificationFailedEvent, ChannelCreatedEvent } from '../domain/events/notifications.events'
import { ProviderFactory } from '../infrastructure/providers/provider-factory'

// ─── Channel Commands ───

export class CreateChannelCommand {
  constructor(readonly tenantId: string | undefined, readonly channelType: ChannelType, readonly providerType: ProviderType, readonly name: string, readonly configJson?: Record<string, unknown>) {}
}
export class UpdateChannelCommand {
  constructor(readonly id: string, readonly name?: string, readonly configJson?: Record<string, unknown>, readonly isActive?: boolean) {}
}
export class DeleteChannelCommand { constructor(readonly id: string) {} }
export class ListChannelsQuery { constructor(readonly tenantId?: string) {} }
export class GetChannelQuery { constructor(readonly id: string) {} }

@Injectable()
export class CreateChannelHandler {
  constructor(private readonly repo: NotificationsRepository, private readonly outbox: OutboxService) {}
  async execute(cmd: CreateChannelCommand): Promise<NotificationChannel> {
    const channel = NotificationChannel.create({ tenantId: cmd.tenantId, channelType: cmd.channelType, providerType: cmd.providerType, name: cmd.name, configJson: cmd.configJson })
    await this.repo.saveChannel(channel)
    await this.outbox.publish(new ChannelCreatedEvent(channel.id, channel.tenantId, channel.channelType, channel.providerType))
    return channel
  }
}
@Injectable()
export class UpdateChannelHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(cmd: UpdateChannelCommand): Promise<NotificationChannel> {
    const channel = await this.repo.findChannelById(cmd.id)
    if (!channel) throw new NotFoundException('Channel not found')
    const updated = new NotificationChannel(channel.id, channel.tenantId, channel.channelType, channel.providerType,
      cmd.name ?? channel.name, cmd.configJson ?? channel.configJson, cmd.isActive ?? channel.isActive,
      channel.createdAt, new Date())
    await this.repo.saveChannel(updated); return updated
  }
}
@Injectable()
export class DeleteChannelHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(cmd: DeleteChannelCommand): Promise<void> { await this.repo.deleteChannel(cmd.id) }
}
@Injectable()
export class ListChannelsHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(q: ListChannelsQuery): Promise<NotificationChannel[]> { return this.repo.listChannels(q.tenantId) }
}
@Injectable()
export class GetChannelHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(q: GetChannelQuery): Promise<NotificationChannel> {
    const channel = await this.repo.findChannelById(q.id)
    if (!channel) throw new NotFoundException('Channel not found'); return channel
  }
}

// ─── Template Commands ───

export class CreateTemplateCommand {
  constructor(readonly tenantId: string | undefined, readonly channelType: ChannelType, readonly templateKey: string, readonly subjectTemplate: string, readonly bodyTemplate: string, readonly variables?: string[], readonly locale?: string) {}
}
export class UpdateTemplateCommand {
  constructor(readonly id: string, readonly subjectTemplate?: string, readonly bodyTemplate?: string, readonly variables?: string[], readonly locale?: string) {}
}
export class DeleteTemplateCommand { constructor(readonly id: string) {} }
export class ListTemplatesQuery { constructor(readonly tenantId?: string) {} }
export class GetTemplateQuery { constructor(readonly id: string) {} }
export class RenderTemplateQuery { constructor(readonly templateId: string, readonly variables: Record<string, unknown>) {} }

@Injectable()
export class CreateTemplateHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(cmd: CreateTemplateCommand): Promise<NotificationTemplate> {
    const template = NotificationTemplate.create({ tenantId: cmd.tenantId, channelType: cmd.channelType, templateKey: cmd.templateKey, subjectTemplate: cmd.subjectTemplate, bodyTemplate: cmd.bodyTemplate, variables: cmd.variables, locale: cmd.locale })
    await this.repo.saveTemplate(template); return template
  }
}
@Injectable()
export class UpdateTemplateHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(cmd: UpdateTemplateCommand): Promise<NotificationTemplate> {
    const template = await this.repo.findTemplateById(cmd.id)
    if (!template) throw new NotFoundException('Template not found')
    const updated = new NotificationTemplate(template.id, template.tenantId, template.channelType, template.templateKey,
      cmd.subjectTemplate ?? template.subjectTemplate, cmd.bodyTemplate ?? template.bodyTemplate,
      cmd.variables ?? template.variables, cmd.locale ?? template.locale, template.createdAt, new Date())
    await this.repo.saveTemplate(updated); return updated
  }
}
@Injectable()
export class DeleteTemplateHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(cmd: DeleteTemplateCommand): Promise<void> { await this.repo.deleteTemplate(cmd.id) }
}
@Injectable()
export class ListTemplatesHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(q: ListTemplatesQuery): Promise<NotificationTemplate[]> { return this.repo.listTemplates(q.tenantId) }
}
@Injectable()
export class GetTemplateHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(q: GetTemplateQuery): Promise<NotificationTemplate> {
    const template = await this.repo.findTemplateById(q.id)
    if (!template) throw new NotFoundException('Template not found'); return template
  }
}
@Injectable()
export class RenderTemplateHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(q: RenderTemplateQuery): Promise<{ subject: string; body: string }> {
    const template = await this.repo.findTemplateById(q.templateId)
    if (!template) throw new NotFoundException('Template not found')
    let subject = template.subjectTemplate; let body = template.bodyTemplate
    for (const [key, value] of Object.entries(q.variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      subject = subject.replace(regex, String(value))
      body = body.replace(regex, String(value))
    }
    return { subject, body }
  }
}

// ─── Notification Commands ───

export class SendEmailCommand {
  constructor(readonly tenantId: string | undefined, readonly to: string, readonly subject: string, readonly body: string, readonly isHtml?: boolean, readonly channelId?: string) {}
}
export class SendPushCommand {
  constructor(readonly tenantId: string | undefined, readonly deviceToken: string, readonly title: string, readonly body: string, readonly data?: Record<string, unknown>, readonly channelId?: string) {}
}
export class EnqueueNotificationCommand {
  constructor(readonly tenantId: string | undefined, readonly channelType: ChannelType, readonly channelId: string | undefined, readonly templateId: string | undefined, readonly toAddress: string, readonly subject?: string, readonly body?: string, readonly variables?: Record<string, unknown>, readonly priority?: number, readonly scheduledAt?: string) {}
}
export class CancelNotificationCommand { constructor(readonly id: string) {} }
export class ListNotificationsQuery {
  constructor(readonly tenantId?: string, readonly status?: string, readonly channelType?: string, readonly cursor?: string, readonly limit?: number) {}
}

@Injectable()
export class SendEmailHandler {
  private readonly logger = new Logger(SendEmailHandler.name)
  constructor(private readonly repo: NotificationsRepository, private readonly outbox: OutboxService, private readonly providerFactory: ProviderFactory) {}
  async execute(cmd: SendEmailCommand): Promise<Notification> {
    const notification = Notification.create({ tenantId: cmd.tenantId, channelType: 'EMAIL', channelId: cmd.channelId, toAddress: cmd.to, subject: cmd.subject, body: cmd.body })
    await this.repo.saveNotification(notification)
    await this.outbox.publish(new NotificationEnqueuedEvent(notification.id, notification.tenantId, 'EMAIL', cmd.to, cmd.subject))
    const provider = this.providerFactory.getEmailProvider()
    const result = await provider.send({ from: process.env.EMAIL_FROM || 'noreply@ultraerp.com', to: cmd.to, subject: cmd.subject, body: cmd.body, isHtml: cmd.isHtml })
    const log = new NotificationLog(randomUUID(), notification.tenantId, notification.id, 'EMAIL', cmd.to, cmd.subject, cmd.body.substring(0, 200), result.success ? 'SENT' : 'FAILED', result.provider, result.providerMessageId ?? null, result.error ?? null, new Date())
    await this.repo.saveLog(log)
    if (result.success) {
      const sent = notification.markSent(result.providerMessageId)
      await this.repo.saveNotification(sent)
      return sent
    } else {
      const failed = notification.markFailed(result.error ?? 'Unknown error')
      await this.repo.saveNotification(failed)
      await this.outbox.publish(new NotificationFailedEvent(notification.id, notification.tenantId, result.error ?? 'Unknown error', 'EMAIL', cmd.to))
      return failed
    }
  }
}
@Injectable()
export class SendPushHandler {
  private readonly logger = new Logger(SendPushHandler.name)
  constructor(private readonly repo: NotificationsRepository, private readonly outbox: OutboxService, private readonly providerFactory: ProviderFactory) {}
  async execute(cmd: SendPushCommand): Promise<Notification> {
    const notification = Notification.create({ tenantId: cmd.tenantId, channelType: 'PUSH', channelId: cmd.channelId, toAddress: cmd.deviceToken, subject: cmd.title, body: cmd.body })
    await this.repo.saveNotification(notification)
    const provider = this.providerFactory.getPushProvider()
    const result = await provider.sendPush({ deviceToken: cmd.deviceToken, title: cmd.title, body: cmd.body, data: cmd.data })
    const log = new NotificationLog(randomUUID(), notification.tenantId, notification.id, 'PUSH', cmd.deviceToken, cmd.title, cmd.body.substring(0, 200), result.success ? 'SENT' : 'FAILED', result.provider, result.providerMessageId ?? null, result.error ?? null, new Date())
    await this.repo.saveLog(log)
    if (result.success) {
      const sent = notification.markSent(result.providerMessageId)
      await this.repo.saveNotification(sent); return sent
    } else {
      const failed = notification.markFailed(result.error ?? 'Unknown error')
      await this.repo.saveNotification(failed); return failed
    }
  }
}
@Injectable()
export class EnqueueNotificationHandler {
  constructor(private readonly repo: NotificationsRepository, private readonly outbox: OutboxService) {}
  async execute(cmd: EnqueueNotificationCommand): Promise<Notification> {
    const notification = Notification.create({
      tenantId: cmd.tenantId, channelType: cmd.channelType, channelId: cmd.channelId,
      templateId: cmd.templateId, toAddress: cmd.toAddress, subject: cmd.subject, body: cmd.body,
      variables: cmd.variables, priority: cmd.priority,
      scheduledAt: cmd.scheduledAt ? new Date(cmd.scheduledAt) : undefined,
    })
    await this.repo.saveNotification(notification)
    await this.outbox.publish(new NotificationEnqueuedEvent(notification.id, notification.tenantId, cmd.channelType, cmd.toAddress, cmd.subject ?? null))
    return notification
  }
}
@Injectable()
export class CancelNotificationHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(cmd: CancelNotificationCommand): Promise<void> { await this.repo.cancelNotification(cmd.id) }
}
@Injectable()
export class ListNotificationsHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(q: ListNotificationsQuery) { return this.repo.listNotifications(q.tenantId, q.status, q.channelType, q.cursor, q.limit) }
}
@Injectable()
export class GetNotificationHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(id: string): Promise<Notification> {
    const n = await this.repo.findNotificationById(id)
    if (!n) throw new NotFoundException('Notification not found'); return n
  }
}

// ─── Logs ───

export class ListLogsQuery {
  constructor(readonly tenantId?: string, readonly channelType?: string, readonly cursor?: string, readonly limit?: number) {}
}
@Injectable()
export class ListLogsHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(q: ListLogsQuery) { return this.repo.listLogs(q.tenantId, q.channelType, q.cursor, q.limit) }
}

// ─── Preferences ───

export class GetPreferencesQuery { constructor(readonly userId: string, readonly tenantId?: string) {} }
export class SetPreferencesCommand {
  constructor(readonly userId: string, readonly channelType: ChannelType, readonly isEnabled: boolean, readonly tenantId?: string) {}
}
@Injectable()
export class GetPreferencesHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(q: GetPreferencesQuery): Promise<NotificationPreference[]> { return this.repo.listPreferences(q.userId, q.tenantId) }
}
@Injectable()
export class SetPreferencesHandler {
  constructor(private readonly repo: NotificationsRepository) {}
  async execute(cmd: SetPreferencesCommand): Promise<NotificationPreference> {
    const pref = NotificationPreference.create({ tenantId: cmd.tenantId, userId: cmd.userId, channelType: cmd.channelType, isEnabled: cmd.isEnabled })
    await this.repo.savePreference(pref); return pref
  }
}
