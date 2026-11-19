import { Injectable, UnauthorizedException } from '@nestjs/common'
import { NotFoundError } from '@crm/shared'
import { authenticator } from 'otplib'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { VerifyMfaCommand } from './auth.commands'
import { MfaDisabledEvent } from '../../domain/events/auth.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class DisableMfaHandler {
  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: VerifyMfaCommand) {
    const methods = await this.repo.findMfaMethodsByUser(command.tenantId, command.userId)
    const method = methods.find((candidate) => candidate.id === command.methodId)
    if (!method || !method.isActive) {
      throw new NotFoundError('MfaMethod', command.methodId)
    }
    if (method.type !== 'TOTP') {
      throw new UnauthorizedException('Only verified TOTP methods can be disabled with this flow')
    }

    let verified = false
    try {
      verified = authenticator.verify({ token: command.code, secret: method.secret })
    } catch {
      verified = false
    }
    if (!verified) {
      throw new UnauthorizedException('Invalid MFA code')
    }

    await this.repo.saveMfaMethod(method.deactivate())
    await this.outbox.publish(new MfaDisabledEvent(command.userId, command.methodId))
    return { disabled: true }
  }
}
