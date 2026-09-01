import { Injectable, Logger } from '@nestjs/common'
import { ConflictError } from '@crm/shared'
import { UserRepository } from '../../domain/repositories/user.repository'
import { User } from '../../domain/entities/user.entity'
import { NaturalPersonProfile } from '../../domain/entities/natural-person-profile.entity'
import { LegalEntityProfile } from '../../domain/entities/legal-entity-profile.entity'
import { CreateUserCommand } from './user.commands'
import { UserCreatedEvent } from '../../domain/events/user.events'
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
