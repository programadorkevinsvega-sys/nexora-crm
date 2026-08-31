import { Injectable, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { MfaRecoveryCode } from '../../domain/entities/mfa-recovery-code.entity'
import { RegenerateRecoveryCodesCommand } from './auth.commands'

@Injectable()
export class RegenerateRecoveryCodesHandler {
  private readonly logger = new Logger(RegenerateRecoveryCodesHandler.name)

  constructor(private readonly repo: AuthRepository) {}

  async execute(command: RegenerateRecoveryCodesCommand) {
    await this.repo.deleteRecoveryCodesByUser(command.userId)

    const codes: string[] = []
    const entities: MfaRecoveryCode[] = []

    for (let i = 0; i < 8; i++) {
      const code = crypto.randomUUID().split('-').join('').substring(0, 16).toUpperCase()
      const hash = await bcrypt.hash(code, 10)
      entities.push(MfaRecoveryCode.create({ userId: command.userId, codeHash: hash }))
      codes.push(code)
    }

    await this.repo.saveRecoveryCodes(entities)
    this.logger.log(`Recovery codes regenerated for user ${command.userId}`)

    return codes
  }
}
