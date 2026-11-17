import { Injectable } from '@nestjs/common'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { GetRecoveryCodesCommand } from './auth.commands'

@Injectable()
export class GetRecoveryCodesHandler {
  constructor(private readonly repo: AuthRepository) {}

  async execute(command: GetRecoveryCodesCommand) {
    const codes = await this.repo.findRecoveryCodesByUser(command.userId)
    return codes.map((c) => ({
      id: c.id,
      used: c.isUsed,
      usedAt: c.usedAt?.toISOString() ?? null,
    }))
  }
}
