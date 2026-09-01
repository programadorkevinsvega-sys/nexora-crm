import { Injectable, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'
import { Notification, NotificationLog, ChannelType } from '../domain/entities/notification.entity'
import { OutboxService } from '../../../common/outbox/outbox.service'
import { NotificationEnqueuedEvent, NotificationFailedEvent } from '../domain/events/notifications.events'
import { ProviderFactory } from '../infrastructure/providers/provider-factory'

export class SendEmailCommand {
  constructor(
    readonly tenantId: string | undefined,
    readonly to: string,
    readonly subject: string,
    readonly body: string,
    readonly isHtml?: boolean,
    readonly channelId?: string,
  ) {}
}

export class SendPushCommand {
  constructor(
    readonly tenantId: string | undefined,
    readonly deviceToken: string,
    readonly title: string,
    readonly body: string,
    readonly data?: Record<string, unknown>,
    readonly channelId?: string,
  ) {}
}

export class EnqueueNotificationCommand {
  constructor(
    readonly tenantId: string | undefined,
    readonly channelType: ChannelType,
    readonly channelId: string | undefined,
    readonly templateId: string | undefined,
    readonly toAddress: string,
    readonly subject?: string,
    readonly body?: string,
    readonly variables?: Record<string, unknown>,
    readonly priority?: number,
    readonly scheduledAt?: string,
  ) {}
}

export class CancelNotificationCommand {
  constructor(readonly id: string) {}
}

@Injectable()
export class SendEmailHandler {
  private readonly logger = new Logger(SendEmailHandler.name)

  constructor(
    private readonly repo: NotificationsRepository,
    private readonly outbox: OutboxService,
    private readonly providerFactory: ProviderFactory,
  ) {}

  async execute(cmd: SendEmailCommand): Promise<Notification> {
    const notification = Notification.create({
      tenantId: cmd.tenantId,
      channelType: 'EMAIL',
      channelId: cmd.channelId,
      toAddress: cmd.to,
      subject: cmd.subject,
      body: cmd.body,
    })
    await this.repo.saveNotification(notification)
    await this.outbox.publish(
      new NotificationEnqueuedEvent(notification.id, notification.tenantId, 'EMAIL', cmd.to, cmd.subject),
    )
    const provider = this.providerFactory.getEmailProvider()
    const result = await provider.send({
      from: process.env.EMAIL_FROM || 'noreply@ultraerp.com',
      to: cmd.to,
      subject: cmd.subject,
      body: cmd.body,
      isHtml: cmd.isHtml,
    })
    const log = new NotificationLog(
      randomUUID(),
      notification.tenantId,
      notification.id,
      'EMAIL',
      cmd.to,
      cmd.subject,
      cmd.body.substring(0, 200),
      result.success ? 'SENT' : 'FAILED',
      result.provider,
      result.providerMessageId ?? null,
      result.error ?? null,
      new Date(),
    )
    await this.repo.saveLog(log)
    if (result.success) {
      const sent = notification.markSent(result.providerMessageId)
      await this.repo.saveNotification(sent)
      return sent
    } else {
      const failed = notification.markFailed(result.error ?? 'Unknown error')
      await this.repo.saveNotification(failed)
      await this.outbox.publish(
        new NotificationFailedEvent(notification.id, notification.tenantId, result.error ?? 'Unknown error', 'EMAIL', cmd.to),
      )
      return failed
    }
  }
}

@Injectable()
export class SendPushHandler {
  private readonly logger = new Logger(SendPushHandler.name)

  constructor(
    private readonly repo: NotificationsRepository,
    private readonly outbox: OutboxService,
    private readonly providerFactory: ProviderFactory,
  ) {}

  async execute(cmd: SendPushCommand): Promise<Notification> {
    const notification = Notification.create({
      tenantId: cmd.tenantId,
      channelType: 'PUSH',
      channelId: cmd.channelId,
      toAddress: cmd.deviceToken,
      subject: cmd.title,
      body: cmd.body,
    })
    await this.repo.saveNotification(notification)
    const provider = this.providerFactory.getPushProvider()
    const result = await provider.sendPush({
      deviceToken: cmd.deviceToken,
      title: cmd.title,
      body: cmd.body,
      data: cmd.data,
    })
    const log = new NotificationLog(
      randomUUID(),
      notification.tenantId,
      notification.id,
      'PUSH',
      cmd.deviceToken,
      cmd.title,
      cmd.body.substring(0, 200),
      result.success ? 'SENT' : 'FAILED',
      result.provider,
      result.providerMessageId ?? null,
      result.error ?? null,
      new Date(),
    )
    await this.repo.saveLog(log)
    if (result.success) {
      const sent = notification.markSent(result.providerMessageId)
      await this.repo.saveNotification(sent)
      return sent
    } else {
      const failed = notification.markFailed(result.error ?? 'Unknown error')
      await this.repo.saveNotification(failed)
      return failed
    }
  }
}

@Injectable()
export class EnqueueNotificationHandler {
  constructor(
    private readonly repo: NotificationsRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(cmd: EnqueueNotificationCommand): Promise<Notification> {
    const notification = Notification.create({
      tenantId: cmd.tenantId,
      channelType: cmd.channelType,
      channelId: cmd.channelId,
      templateId: cmd.templateId,
      toAddress: cmd.toAddress,
      subject: cmd.subject,
      body: cmd.body,
      variables: cmd.variables,
      priority: cmd.priority,
      scheduledAt: cmd.scheduledAt ? new Date(cmd.scheduledAt) : undefined,
    })
    await this.repo.saveNotification(notification)
    await this.outbox.publish(
      new NotificationEnqueuedEvent(notification.id, notification.tenantId, cmd.channelType, cmd.toAddress, cmd.subject ?? null),
    )
    return notification
  }
}

@Injectable()
export class CancelNotificationHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(cmd: CancelNotificationCommand): Promise<void> {
    await this.repo.cancelNotification(cmd.id)
  }
}
