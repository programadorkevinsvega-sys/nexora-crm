import { createHash, randomBytes } from 'crypto'

export type ApiKeyScope =
  | 'contacts:read'
  | 'contacts:write'
  | 'companies:read'
  | 'companies:write'
  | 'deals:read'
  | 'deals:write'
  | 'interactions:read'
  | 'interactions:write'
  | 'tickets:read'
  | 'tickets:write'
  | 'quotes:read'
  | 'quotes:write'
  | 'contracts:read'
  | 'contracts:write'
  | 'campaigns:read'
  | 'campaigns:write'
  | 'scoring:read'
  | 'scoring:write'
  | 'kb:read'
  | 'ai:read'
  | 'ai:write'
  | 'webhooks:manage'

export class ApiKey {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly keyHash: string,
    readonly keyPrefix: string,
    readonly scopes: ApiKeyScope[],
    readonly isActive: boolean,
    readonly lastUsedAt: Date | null,
    readonly expiresAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static generateRawKey(): string {
    return 'nex_live_' + randomBytes(32).toString('hex')
  }

  static hashKey(rawKey: string): string {
    return createHash('sha256').update(rawKey).digest('hex')
  }

  static prefixFromKey(rawKey: string): string {
    return rawKey.slice(0, 16) + '...'
  }

  static create(props: {
    tenantId: string
    name: string
    scopes: ApiKeyScope[]
    rawKey: string
    expiresAt?: Date | null
  }): ApiKey {
    const now = new Date()
    return new ApiKey(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      ApiKey.hashKey(props.rawKey),
      ApiKey.prefixFromKey(props.rawKey),
      props.scopes,
      true,
      null,
      props.expiresAt ?? null,
      now,
      now,
    )
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false
    return new Date() > this.expiresAt
  }

  hasScope(scope: ApiKeyScope): boolean {
    return this.scopes.includes(scope)
  }
}
