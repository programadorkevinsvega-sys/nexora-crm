import { Injectable } from '@nestjs/common'
import { NotFoundError, ConflictError } from '@crm/shared'
import { UserRepository } from '../../domain/repositories/user.repository'
import { UpdateDeviceCommand } from './user.commands'

@Injectable()
export class UpdateDeviceHandler {
  constructor(private readonly repo: UserRepository) {}

  async execute(command: UpdateDeviceCommand): Promise<void> {
    const device = await this.repo.findDeviceById(command.deviceId)
    if (!device) throw new NotFoundError('UserMobileDevice', command.deviceId)
    if (device.userId !== command.userId) throw new ConflictError('Device does not belong to user')

    const updated = device.update({
      deviceModel: command.deviceModel,
      osVersion: command.osVersion,
      pushNotificationToken: command.pushNotificationToken,
      isTrustedDevice: command.isTrustedDevice,
    })

    await this.repo.saveDevice(updated)
  }
}
