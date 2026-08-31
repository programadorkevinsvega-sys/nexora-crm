import { Injectable, Logger } from '@nestjs/common'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { PasswordPolicy } from '../../domain/entities/password-policy.entity'
import { UpdatePasswordPolicyCommand } from './auth.commands'

@Injectable()
export class UpdatePasswordPolicyHandler {
  private readonly logger = new Logger(UpdatePasswordPolicyHandler.name)

  constructor(private readonly repo: AuthRepository) {}

  async execute(command: UpdatePasswordPolicyCommand): Promise<void> {
    const existing = await this.repo.getPasswordPolicy(command.tenantId)
    const policy = existing
      ? existing.update({
          minLength: command.minLength,
          requireUppercase: command.requireUppercase,
          requireNumbers: command.requireNumbers,
          requireSymbols: command.requireSymbols,
          expireDays: command.expireDays,
          preventReuseLastN: command.preventReuseLastN,
        })
      : PasswordPolicy.default(command.tenantId).update({
          minLength: command.minLength,
          requireUppercase: command.requireUppercase,
          requireNumbers: command.requireNumbers,
          requireSymbols: command.requireSymbols,
          expireDays: command.expireDays,
          preventReuseLastN: command.preventReuseLastN,
        })

    await this.repo.savePasswordPolicy(policy)
    this.logger.log(`Password policy updated for tenant ${command.tenantId}`)
  }
}
