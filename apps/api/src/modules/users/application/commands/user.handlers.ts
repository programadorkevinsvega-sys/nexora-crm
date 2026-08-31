import { Injectable, Logger } from '@nestjs/common'
import { NotFoundError, ConflictError } from '@crm/shared'
import { UserRepository } from '../../domain/repositories/user.repository'
import { User } from '../../domain/entities/user.entity'
import { NaturalPersonProfile } from '../../domain/entities/natural-person-profile.entity'
import { LegalEntityProfile } from '../../domain/entities/legal-entity-profile.entity'
import { UserOAuthLink } from '../../domain/entities/user-oauth-link.entity'
import { UserMobileDevice } from '../../domain/entities/user-mobile-device.entity'
import {
  CreateUserCommand, UpdateUserCommand, DeleteUserCommand,
  UpdateNaturalPersonProfileCommand, UpdateLegalEntityProfileCommand,
  LinkOAuthCommand, UnlinkOAuthCommand,
  RegisterDeviceCommand, UpdateDeviceCommand, RemoveDeviceCommand,
} from './user.commands'
import {
  UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent,
  UserOAuthLinkedEvent, UserOAuthUnlinkedEvent,
  UserDeviceRegisteredEvent, UserDeviceRemovedEvent,
  UserProfileUpdatedEvent,
} from '../../domain/events/user.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class CreateUserHandler {
  private readonly logger = new Logger(CreateUserHandler.name)

  constructor(
    private readonly repo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateUserCommand): Promise<{ id: string }> {
    const existing = await this.repo.findByEmail(command.tenantId, command.email)
    if (existing) throw new ConflictError('Email already registered')

    if (command.profileType === 'NATURAL_PERSON') {
      if (!command.firstName || !command.lastName) {
        throw new ConflictError('firstName and lastName are required for natural person profiles')
      }
    } else if (!command.legalName || !command.taxId) {
      throw new ConflictError('legalName and taxId are required for legal entity profiles')
    }

    const user = User.create({
      tenantId: command.tenantId,
      email: command.email,
      passwordHash: command.passwordHash,
      profileType: command.profileType,
      managerId: command.managerId,
    })

    if (command.profileType === 'NATURAL_PERSON') {
      const profile = NaturalPersonProfile.create({
        id: user.profileId,
        tenantId: command.tenantId,
        firstName: command.firstName!,
        lastName: command.lastName!,
        identificationNumber: command.identificationNumber,
        phone: command.phone,
        countryCode: command.countryCode,
        preferredLanguage: command.preferredLanguage,
        timezone: command.timezone,
        avatarUrl: command.avatarUrl,
      })
      await this.repo.saveNaturalPersonProfile(profile)
    } else {
      const profile = LegalEntityProfile.create({
        id: user.profileId,
        tenantId: command.tenantId,
        legalName: command.legalName!,
        commercialName: command.commercialName,
        taxId: command.taxId!,
        legalAddress: command.legalAddress,
        countryCode: command.countryCode,
      })
      await this.repo.saveLegalEntityProfile(profile)
    }

    await this.repo.save(user)

    await this.outbox.publish(new UserCreatedEvent(
      user.id, 'user.created', command.tenantId, command.email, command.profileType,
    ))

    this.logger.log(`User created: ${user.id} (${command.email})`)

    return { id: user.id }
  }
}

@Injectable()
export class UpdateUserHandler {
  constructor(
    private readonly repo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const user = await this.repo.findById(command.tenantId, command.id)
    if (!user) throw new NotFoundError('User', command.id)

    if (command.email && command.email !== user.email) {
      const existing = await this.repo.findByEmail(command.tenantId, command.email)
      if (existing) throw new ConflictError('Email already in use')
    }

    const updated = user.update({
      email: command.email,
      passwordHash: command.passwordHash,
      status: command.status,
      managerId: command.managerId,
    })

    await this.repo.save(updated)
    await this.outbox.publish(new UserUpdatedEvent(updated.id))
  }
}

@Injectable()
export class DeleteUserHandler {
  constructor(
    private readonly repo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.repo.findById(command.tenantId, command.id)
    if (!user) throw new NotFoundError('User', command.id)

    const updated = user.update({ status: 'INACTIVE' })
    await this.repo.save(updated)
    await this.outbox.publish(new UserDeletedEvent(updated.id))
  }
}

@Injectable()
export class UpdateNaturalPersonProfileHandler {
  private readonly logger = new Logger(UpdateNaturalPersonProfileHandler.name)

  constructor(
    private readonly repo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateNaturalPersonProfileCommand): Promise<void> {
    const user = await this.repo.findById(command.tenantId, command.userId)
    if (!user) throw new NotFoundError('User', command.userId)
    if (user.profileType !== 'NATURAL_PERSON') throw new ConflictError('User is not a natural person')

    const profile = await this.repo.getNaturalPersonProfile(user.profileId)
    if (!profile) throw new NotFoundError('NaturalPersonProfile', user.profileId)

    const updated = profile.update({
      firstName: command.firstName,
      lastName: command.lastName,
      identificationNumber: command.identificationNumber,
      phone: command.phone,
      countryCode: command.countryCode,
      preferredLanguage: command.preferredLanguage,
      timezone: command.timezone,
      avatarUrl: command.avatarUrl,
    })

    await this.repo.saveNaturalPersonProfile(updated)
    await this.outbox.publish(new UserProfileUpdatedEvent(user.id, 'user.profile.updated'))
    this.logger.log(`Natural person profile updated for user ${command.userId}`)
  }
}

@Injectable()
export class UpdateLegalEntityProfileHandler {
  private readonly logger = new Logger(UpdateLegalEntityProfileHandler.name)

  constructor(
    private readonly repo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateLegalEntityProfileCommand): Promise<void> {
    const user = await this.repo.findById(command.tenantId, command.userId)
    if (!user) throw new NotFoundError('User', command.userId)
    if (user.profileType !== 'LEGAL_ENTITY') throw new ConflictError('User is not a legal entity')

    const profile = await this.repo.getLegalEntityProfile(user.profileId)
    if (!profile) throw new NotFoundError('LegalEntityProfile', user.profileId)

    const updated = profile.update({
      legalName: command.legalName,
      commercialName: command.commercialName,
      taxId: command.taxId,
      legalAddress: command.legalAddress,
      countryCode: command.countryCode,
      isActive: command.isActive,
    })

    await this.repo.saveLegalEntityProfile(updated)
    await this.outbox.publish(new UserProfileUpdatedEvent(user.id, 'user.profile.updated'))
    this.logger.log(`Legal entity profile updated for user ${command.userId}`)
  }
}

@Injectable()
export class LinkOAuthHandler {
  private readonly logger = new Logger(LinkOAuthHandler.name)

  constructor(
    private readonly repo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: LinkOAuthCommand): Promise<void> {
    const existing = await this.repo.findOAuthLink(command.userId, command.providerName)
    if (existing) throw new ConflictError('OAuth link already exists for this provider')

    const link = UserOAuthLink.create({
      userId: command.userId,
      providerName: command.providerName,
      providerUserId: command.providerUserId,
    })

    await this.repo.saveOAuthLink(link)
    await this.outbox.publish(new UserOAuthLinkedEvent(command.userId, command.providerName))
    this.logger.log(`OAuth ${command.providerName} linked to user ${command.userId}`)
  }
}

@Injectable()
export class UnlinkOAuthHandler {
  private readonly logger = new Logger(UnlinkOAuthHandler.name)

  constructor(
    private readonly repo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UnlinkOAuthCommand): Promise<void> {
    const link = await this.repo.findOAuthLink(command.userId, command.providerName)
    if (!link) throw new NotFoundError('OAuthLink', `${command.userId}/${command.providerName}`)

    await this.repo.deleteOAuthLink(link.id)
    await this.outbox.publish(new UserOAuthUnlinkedEvent(command.userId, command.providerName))
    this.logger.log(`OAuth ${command.providerName} unlinked from user ${command.userId}`)
  }
}

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
