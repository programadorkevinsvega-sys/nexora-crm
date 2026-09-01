import { Injectable, Logger } from '@nestjs/common'
import { NotFoundError, ConflictError } from '@crm/shared'
import { UserRepository } from '../../domain/repositories/user.repository'
import { UpdateNaturalPersonProfileCommand } from './user.commands'
import { UserProfileUpdatedEvent } from '../../domain/events/user.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

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
