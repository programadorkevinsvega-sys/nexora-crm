import { Injectable, Logger } from '@nestjs/common'
import { ConflictError } from '@crm/shared'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { OAuthProvider } from '../../domain/entities/oauth-provider.entity'
import { CreateOAuthProviderCommand } from './auth.commands'

@Injectable()
export class CreateOAuthProviderHandler {
  private readonly logger = new Logger(CreateOAuthProviderHandler.name)

  constructor(private readonly repo: AuthRepository) {}

  async execute(command: CreateOAuthProviderCommand) {
    const existing = await this.repo.findOAuthProviderByName(command.tenantId, command.providerName)
    if (existing) throw new ConflictError(`OAuth provider ${command.providerName} already exists`)

    const provider = OAuthProvider.create({
      tenantId: command.tenantId,
      providerName: command.providerName,
      clientId: command.clientId,
      clientSecret: command.clientSecret,
    })
    await this.repo.saveOAuthProvider(provider)
    this.logger.log(`OAuth provider ${command.providerName} created for tenant ${command.tenantId}`)
    return { id: provider.id }
  }
}
