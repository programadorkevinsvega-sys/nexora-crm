import { Injectable } from '@nestjs/common'
import { NotFoundError } from '@crm/shared'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { DeleteIpRestrictionCommand } from './auth.commands'

@Injectable()
export class DeleteIpRestrictionHandler {
  constructor(private readonly repo: AuthRepository) {}

  async execute(command: DeleteIpRestrictionCommand): Promise<void> {
    const existing = await this.repo.findIpRestrictionById(command.id)
    if (!existing) throw new NotFoundError('IpRestriction', command.id)

    await this.repo.deleteIpRestriction(command.id)
  }
}
