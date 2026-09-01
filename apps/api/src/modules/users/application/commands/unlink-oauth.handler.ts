import { Injectable, Logger } from '@nestjs/common'
import { NotFoundError } from '@crm/shared'
import { UserRepository } from '../../domain/repositories/user.repository'
import { UnlinkOAuthCommand } from './user.commands'
import { UserOAuthUnlinkedEvent } from '../../domain/events/user.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

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
