import { Injectable } from '@nestjs/common'
import { TenantsRepository } from '../../domain/repositories/tenants.repository'
import { TenantApiKey } from '../../domain/entities/config.entity'

export class CreateApiKeyCommand {
  constructor(readonly tenantId: string, readonly name: string, readonly scopes?: string[], readonly expiresAt?: Date) {}
}

export class RevokeApiKeyCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListApiKeysQuery {
  constructor(readonly tenantId: string) {}
}

@Injectable()
export class CreateApiKeyHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: CreateApiKeyCommand): Promise<{ apiKey: TenantApiKey; rawToken: string }> {
    const { apiKey, rawToken } = TenantApiKey.create({
      tenantId: cmd.tenantId,
      name: cmd.name,
      scopes: cmd.scopes,
      expiresAt: cmd.expiresAt,
    })
    await this.repo.saveApiKey(apiKey)
    return { apiKey, rawToken }
  }
}

@Injectable()
export class RevokeApiKeyHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: RevokeApiKeyCommand): Promise<void> {
    await this.repo.revokeApiKey(cmd.tenantId, cmd.id)
  }
}

@Injectable()
export class ListApiKeysHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(q: ListApiKeysQuery): Promise<TenantApiKey[]> {
    return this.repo.listApiKeys(q.tenantId)
  }
}
