import { Injectable } from '@nestjs/common'
import { NotFoundError } from '@crm/shared'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { DeleteOAuthProviderCommand } from './auth.commands'

@Injectable()
export class DeleteOAuthProviderHandler {
  constructor(private readonly repo: AuthRepository) {}

  async execute(command: DeleteOAuthProviderCommand): Promise<void> {
    const existing = await this.repo.findOAuthProviderById(command.id)
    if (!existing) throw new NotFoundError('OAuthProvider', command.id)

    await this.repo.deleteOAuthProvider(command.id)
  }
}
