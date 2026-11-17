import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { NotFoundError } from '@crm/shared'
import * as bcrypt from 'bcrypt'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { PasswordPolicy } from '../../domain/entities/password-policy.entity'
import { PasswordHistory } from '../../domain/entities/password-history.entity'
import { ChangePasswordCommand } from './auth.commands'
import { PasswordChangedEvent } from '../../domain/events/auth.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { UserLookupService } from './user-lookup.service'

@Injectable()
export class ChangePasswordHandler {
  private readonly logger = new Logger(ChangePasswordHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
    private readonly userLookup: UserLookupService,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const user = await this.userLookup.findById(command.tenantId, command.userId)
    if (!user) throw new NotFoundError('User', command.userId)

    const valid = await bcrypt.compare(command.currentPassword, user.passwordHash ?? '')
    if (!valid) throw new UnauthorizedException('Current password is incorrect')

    const policy = await this.repo.getPasswordPolicy(command.tenantId)
    const effectivePolicy = policy ?? PasswordPolicy.default(command.tenantId)
    const errors = effectivePolicy.validate(command.newPassword)
    if (errors.length > 0) throw new BadRequestException(errors.join('; '))

    const history = await this.repo.findPasswordHistoryByUser(command.userId, effectivePolicy.preventReuseLastN)
    for (const entry of history) {
      if (await bcrypt.compare(command.newPassword, entry.passwordHash)) {
        throw new BadRequestException('Password has been used recently')
      }
    }

    const newHash = await bcrypt.hash(command.newPassword, 10)
    const historyEntry = PasswordHistory.create({ userId: command.userId, passwordHash: newHash })
    await this.repo.savePasswordHistory(historyEntry)
    await this.outbox.publish(new PasswordChangedEvent(command.userId))

    this.logger.log(`Password changed for user ${command.userId}`)
  }
}
