import { Injectable, Logger } from '@nestjs/common'
import { ConflictError } from '@crm/shared'
import { UserRepository } from '../../domain/repositories/user.repository'
import { UserOAuthLink } from '../../domain/entities/user-oauth-link.entity'
import { LinkOAuthCommand } from './user.commands'
import { UserOAuthLinkedEvent } from '../../domain/events/user.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

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
