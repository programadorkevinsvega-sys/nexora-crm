import { Injectable, NotFoundException } from '@nestjs/common'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'
import { Notification, NotificationPreference, ChannelType } from '../domain/entities/notification.entity'

export class ListNotificationsQuery {
  constructor(
    readonly tenantId?: string,
    readonly status?: string,
    readonly channelType?: string,
    readonly cursor?: string,
    readonly limit?: number,
  ) {}
}

export class ListLogsQuery {
  constructor(
    readonly tenantId?: string,
    readonly channelType?: string,
    readonly cursor?: string,
    readonly limit?: number,
  ) {}
}

export class GetPreferencesQuery {
  constructor(readonly userId: string, readonly tenantId?: string) {}
}

export class SetPreferencesCommand {
  constructor(
    readonly userId: string,
    readonly channelType: ChannelType,
    readonly isEnabled: boolean,
    readonly tenantId?: string,
  ) {}
}

@Injectable()
export class ListNotificationsHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(q: ListNotificationsQuery) {
    return this.repo.listNotifications(q.tenantId, q.status, q.channelType, q.cursor, q.limit)
  }
}

@Injectable()
export class GetNotificationHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(id: string): Promise<Notification> {
    const n = await this.repo.findNotificationById(id)
    if (!n) throw new NotFoundException('Notification not found')
    return n
  }
}

@Injectable()
export class ListLogsHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(q: ListLogsQuery) {
    return this.repo.listLogs(q.tenantId, q.channelType, q.cursor, q.limit)
  }
}

@Injectable()
export class GetPreferencesHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(q: GetPreferencesQuery): Promise<NotificationPreference[]> {
    return this.repo.listPreferences(q.userId, q.tenantId)
  }
}

@Injectable()
export class SetPreferencesHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(cmd: SetPreferencesCommand): Promise<NotificationPreference> {
    const pref = NotificationPreference.create({
      tenantId: cmd.tenantId,
      userId: cmd.userId,
      channelType: cmd.channelType,
      isEnabled: cmd.isEnabled,
    })
    await this.repo.savePreference(pref)
    return pref
  }
}
