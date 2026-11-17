import { Injectable } from '@nestjs/common'
import { NotFoundError } from '@crm/shared'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { LogoutCommand } from './auth.commands'
import { UserLoggedOutEvent } from '../../domain/events/auth.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class LogoutHandler {
  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const session = await this.repo.findSessionById(command.sessionId)
    if (!session) throw new NotFoundError('Session', command.sessionId)

    const revoked = session.revoke()
    await this.repo.saveSession(revoked)
    await this.outbox.publish(new UserLoggedOutEvent(session.userId, command.sessionId))
  }
}
