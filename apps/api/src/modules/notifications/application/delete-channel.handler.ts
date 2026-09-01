import { Injectable } from '@nestjs/common'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'

export class DeleteChannelCommand {
  constructor(readonly id: string) {}
}

@Injectable()
export class DeleteChannelHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(cmd: DeleteChannelCommand): Promise<void> {
    await this.repo.deleteChannel(cmd.id)
  }
}
