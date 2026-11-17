import { Injectable, Logger } from '@nestjs/common'
import { NotFoundError } from '@crm/shared'
import * as bcrypt from 'bcrypt'
import { authenticator } from 'otplib'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { VerifyMfaCommand } from './auth.commands'
import { MfaVerifiedEvent } from '../../domain/events/auth.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class VerifyMfaHandler {
  private readonly logger = new Logger(VerifyMfaHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: VerifyMfaCommand) {
    const method = await this.repo.findMfaMethodById(command.methodId)
    if (!method) throw new NotFoundError('MfaMethod', command.methodId)

    let verified = false

    if (method.type === 'TOTP') {
      try {
        verified = authenticator.verify({ token: command.code, secret: method.secret })
      } catch (error) {
        this.logger.error(`TOTP verify failed: ${error}`)
        verified = false
      }
    } else if (method.type === 'SMS' || method.type === 'EMAIL') {
      verified = await bcrypt.compare(command.code, method.secret)
    }

    if (!verified) {
      return { verified: false }
    }

    await this.outbox.publish(new MfaVerifiedEvent(command.userId, command.methodId))
    return { verified: true }
  }
}
