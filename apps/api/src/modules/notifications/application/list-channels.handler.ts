import { Injectable } from '@nestjs/common'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'
import { NotificationChannel } from '../domain/entities/notification.entity'

export class ListChannelsQuery {
  constructor(readonly tenantId?: string) {}
}

@Injectable()
export class ListChannelsHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(q: ListChannelsQuery): Promise<NotificationChannel[]> {
    return this.repo.listChannels(q.tenantId)
  }
}
