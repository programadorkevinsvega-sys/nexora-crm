import { Injectable, NotFoundException } from '@nestjs/common'
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

export class UpdateChannelCommand {
  constructor(
    readonly id: string,
    readonly name?: string,
    readonly configJson?: Record<string, unknown>,
    readonly isActive?: boolean,
  ) {}
}

export class DeleteChannelCommand {
  constructor(readonly id: string) {}
}

export class ListChannelsQuery {
  constructor(readonly tenantId?: string) {}
}

export class GetChannelQuery {
  constructor(readonly id: string) {}
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

@Injectable()
export class UpdateChannelHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(cmd: UpdateChannelCommand): Promise<NotificationChannel> {
    const channel = await this.repo.findChannelById(cmd.id)
    if (!channel) throw new NotFoundException('Channel not found')
    const updated = new NotificationChannel(
      channel.id,
      channel.tenantId,
      channel.channelType,
      channel.providerType,
      cmd.name ?? channel.name,
      cmd.configJson ?? channel.configJson,
      cmd.isActive ?? channel.isActive,
      channel.createdAt,
      new Date(),
    )
    await this.repo.saveChannel(updated)
    return updated
  }
}

@Injectable()
export class DeleteChannelHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(cmd: DeleteChannelCommand): Promise<void> {
    await this.repo.deleteChannel(cmd.id)
  }
}

@Injectable()
export class ListChannelsHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(q: ListChannelsQuery): Promise<NotificationChannel[]> {
    return this.repo.listChannels(q.tenantId)
  }
}

@Injectable()
export class GetChannelHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(q: GetChannelQuery): Promise<NotificationChannel> {
    const channel = await this.repo.findChannelById(q.id)
    if (!channel) throw new NotFoundException('Channel not found')
    return channel
  }
}
