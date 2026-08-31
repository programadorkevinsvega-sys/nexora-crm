import { Injectable, Logger } from '@nestjs/common'
import { NotFoundError } from '@crm/shared'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { RevokeSessionCommand } from './auth.commands'
import { SessionRevokedEvent } from '../../domain/events/auth.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class RevokeSessionHandler {
  private readonly logger = new Logger(RevokeSessionHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RevokeSessionCommand): Promise<void> {
    const session = await this.repo.findSessionById(command.sessionId)
    if (!session) throw new NotFoundError('Session', command.sessionId)

    await this.repo.saveSession(session.revoke())
    await this.outbox.publish(new SessionRevokedEvent(session.userId, command.sessionId))
    this.logger.log(`Session ${command.sessionId} revoked`)
  }
}
