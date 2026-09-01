import { Injectable, NotFoundException } from '@nestjs/common'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'
import { NotificationChannel } from '../domain/entities/notification.entity'

export class UpdateChannelCommand {
  constructor(
    readonly id: string,
    readonly name?: string,
    readonly configJson?: Record<string, unknown>,
    readonly isActive?: boolean,
  ) {}
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
