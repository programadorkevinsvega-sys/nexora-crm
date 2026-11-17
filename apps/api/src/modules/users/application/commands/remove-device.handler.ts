import { Injectable, Logger } from '@nestjs/common'
import { NotFoundError, ConflictError } from '@crm/shared'
import { UserRepository } from '../../domain/repositories/user.repository'
import { RemoveDeviceCommand } from './user.commands'
import { UserDeviceRemovedEvent } from '../../domain/events/user.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class RemoveDeviceHandler {
  private readonly logger = new Logger(RemoveDeviceHandler.name)

  constructor(
    private readonly repo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RemoveDeviceCommand): Promise<void> {
    const device = await this.repo.findDeviceById(command.deviceId)
    if (!device) throw new NotFoundError('UserMobileDevice', command.deviceId)
    if (device.userId !== command.userId) throw new ConflictError('Device does not belong to user')

    await this.repo.deleteDevice(command.deviceId)
    await this.outbox.publish(new UserDeviceRemovedEvent(command.userId, command.deviceId))
    this.logger.log(`Device ${command.deviceId} removed from user ${command.userId}`)
  }
}
