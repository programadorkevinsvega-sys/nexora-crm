import { Injectable, NotFoundException } from '@nestjs/common'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'
import { NotificationChannel } from '../domain/entities/notification.entity'

export class GetChannelQuery {
  constructor(readonly id: string) {}
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
