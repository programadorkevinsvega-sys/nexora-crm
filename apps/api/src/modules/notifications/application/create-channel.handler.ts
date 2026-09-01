import { Injectable } from '@nestjs/common'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'
import { NotificationChannel, ChannelType, ProviderType } from '../domain/entities/notification.entity'
import { OutboxService } from '../../../common/outbox/outbox.service'
import { ChannelCreatedEvent } from '../domain/events/notifications.events'

export class CreateChannelCommand {
  constructor(
    readonly tenantId: string | undefined,
    readonly channelType: ChannelType,
    readonly providerType: ProviderType,
    readonly name: string,
    readonly configJson?: Record<string, unknown>,
  ) {}
}

@Injectable()
export class CreateChannelHandler {
  constructor(
    private readonly repo: NotificationsRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(cmd: CreateChannelCommand): Promise<NotificationChannel> {
    const channel = NotificationChannel.create({
      tenantId: cmd.tenantId,
      channelType: cmd.channelType,
      providerType: cmd.providerType,
      name: cmd.name,
      configJson: cmd.configJson,
    })
    await this.repo.saveChannel(channel)
    await this.outbox.publish(
      new ChannelCreatedEvent(channel.id, channel.tenantId, channel.channelType, channel.providerType),
    )
    return channel
  }
}
