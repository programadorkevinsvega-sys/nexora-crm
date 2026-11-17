import { Injectable, Logger } from '@nestjs/common'
import { UserRepository } from '../../domain/repositories/user.repository'
import { UserMobileDevice } from '../../domain/entities/user-mobile-device.entity'
import { RegisterDeviceCommand } from './user.commands'
import { UserDeviceRegisteredEvent } from '../../domain/events/user.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class RegisterDeviceHandler {
  private readonly logger = new Logger(RegisterDeviceHandler.name)

  constructor(
    private readonly repo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RegisterDeviceCommand): Promise<{ id: string }> {
    const existing = await this.repo.findDeviceByIdentifier(command.userId, command.deviceIdentifier)
    if (existing) {
      const updated = existing.markActive().update({
        deviceModel: command.deviceModel,
        osVersion: command.osVersion,
        pushNotificationToken: command.pushNotificationToken,
        isTrustedDevice: command.isTrustedDevice,
      })
      await this.repo.saveDevice(updated)
      return { id: updated.id }
    }

    const device = UserMobileDevice.create({
      tenantId: command.tenantId,
      userId: command.userId,
      deviceIdentifier: command.deviceIdentifier,
      platform: command.platform,
      deviceModel: command.deviceModel,
      osVersion: command.osVersion,
      pushNotificationToken: command.pushNotificationToken,
      isTrustedDevice: command.isTrustedDevice,
    })

    await this.repo.saveDevice(device)
    await this.outbox.publish(new UserDeviceRegisteredEvent(command.userId, device.id, command.platform))
    this.logger.log(`Device ${device.id} registered for user ${command.userId}`)
    return { id: device.id }
  }
}
