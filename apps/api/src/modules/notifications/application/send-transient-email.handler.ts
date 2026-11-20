import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'
import { Notification, NotificationLog } from '../domain/entities/notification.entity'
import { OutboxService } from '../../../common/outbox/outbox.service'
import {
  NotificationEnqueuedEvent,
  NotificationFailedEvent,
  NotificationSentEvent,
} from '../domain/events/notifications.events'
import { ProviderFactory } from '../infrastructure/providers/provider-factory'

export class SendTransientEmailCommand {
  constructor(
    readonly tenantId: string,
    readonly to: string,
    readonly subject: string,
    readonly body: string,
    readonly isHtml = true,
  ) {}
}

@Injectable()
export class SendTransientEmailHandler {
  constructor(
    private readonly repo: NotificationsRepository,
    private readonly outbox: OutboxService,
    private readonly providerFactory: ProviderFactory,
  ) {}

  async execute(command: SendTransientEmailCommand): Promise<Notification> {
    const redactedBody = '[contenido transitorio omitido]'
    const notification = Notification.create({
      tenantId: command.tenantId,
      channelType: 'EMAIL',
      toAddress: command.to,
      subject: command.subject,
      body: redactedBody,
    })

    await this.repo.saveNotification(notification)
    await this.outbox.publish(new NotificationEnqueuedEvent(
      notification.id,
      notification.tenantId,
      'EMAIL',
      command.to,
      command.subject,
    ))

    const result = await this.providerFactory.getEmailProvider().send({
      from: process.env.EMAIL_FROM || 'noreply@ultraerp.com',
      to: command.to,
      subject: command.subject,
      body: command.body,
      isHtml: command.isHtml,
    })

    const log = new NotificationLog(
      randomUUID(),
      notification.tenantId,
      notification.id,
      'EMAIL',
      command.to,
      command.subject,
      redactedBody,
      result.success ? 'SENT' : 'FAILED',
      result.provider,
      result.providerMessageId ?? null,
      result.error ?? null,
      new Date(),
    )
    await this.repo.saveLog(log)

    if (!result.success) {
      const failed = notification.markFailed(result.error ?? 'Email provider rejected the message')
      await this.repo.saveNotification(failed)
      await this.outbox.publish(new NotificationFailedEvent(
        notification.id,
        notification.tenantId,
        result.error ?? 'Email provider rejected the message',
        'EMAIL',
        command.to,
      ))
      return failed
    }

    const sent = notification.markSent(result.providerMessageId)
    await this.repo.saveNotification(sent)
    await this.outbox.publish(new NotificationSentEvent(
      notification.id,
      notification.tenantId,
      result.providerMessageId ?? null,
      'EMAIL',
      command.to,
    ))
    return sent
  }
}
