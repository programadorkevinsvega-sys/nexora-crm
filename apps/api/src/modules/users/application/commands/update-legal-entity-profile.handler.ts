import { Injectable, Logger } from '@nestjs/common'
import { NotFoundError, ConflictError } from '@crm/shared'
import { UserRepository } from '../../domain/repositories/user.repository'
import { UpdateLegalEntityProfileCommand } from './user.commands'
import { UserProfileUpdatedEvent } from '../../domain/events/user.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

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
