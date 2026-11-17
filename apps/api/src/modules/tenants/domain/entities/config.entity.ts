import { randomUUID } from 'crypto'

export class TaxConfiguration {
  constructor(
    readonly id: string, readonly tenantId: string, readonly taxName: string,
    readonly taxPercentage: number, readonly description: string | null,
    readonly taxType: string, readonly isActive: boolean,
    readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    tenantId: string; taxName: string; taxPercentage: number
    description?: string; taxType?: string
  }): TaxConfiguration {
    return new TaxConfiguration(randomUUID(), props.tenantId, props.taxName,
      props.taxPercentage, props.description ?? null,
      props.taxType ?? 'SALES', true, new Date(), new Date())
  }
}

export class TenantLanguage {
  constructor(
    readonly id: string, readonly tenantId: string, readonly isoCode: string,
    readonly name: string, readonly isDefault: boolean, readonly isActive: boolean,
    readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    tenantId: string; isoCode: string; name: string; isDefault?: boolean
  }): TenantLanguage {
    return new TenantLanguage(randomUUID(), props.tenantId, props.isoCode, props.name,
      props.isDefault ?? false, true, new Date(), new Date())
  }
}

export class TenantCurrency {
  constructor(
    readonly id: string, readonly tenantId: string, readonly isoCode: string,
    readonly name: string, readonly symbol: string,
    readonly isBaseCurrency: boolean, readonly isActive: boolean,
    readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    tenantId: string; isoCode: string; name: string; symbol: string; isBaseCurrency?: boolean
  }): TenantCurrency {
    return new TenantCurrency(randomUUID(), props.tenantId, props.isoCode, props.name,
      props.symbol, props.isBaseCurrency ?? false, true, new Date(), new Date())
  }
}

export class TenantApiKey {
  constructor(
    readonly id: string, readonly tenantId: string, readonly name: string,
    readonly tokenHash: string, readonly lastFourChars: string,
    readonly scopesJson: string[], readonly expiresAt: Date | null,
    readonly lastUsedAt: Date | null, readonly isActive: boolean,
    readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    tenantId: string; name: string; scopes?: string[]; expiresAt?: Date
  }): { apiKey: TenantApiKey; rawToken: string } {
    const rawToken = `crm_${randomUUID().replace(/-/g, '')}${randomUUID().replace(/-/g, '')}`
    const tokenHash = rawToken // In production use bcrypt
    const lastFour = rawToken.slice(-4)
    const apiKey = new TenantApiKey(
      randomUUID(), props.tenantId, props.name, tokenHash, lastFour,
      props.scopes ?? [], props.expiresAt ?? null, null, true, new Date(), new Date(),
    )
    return { apiKey, rawToken }
  }
}

export class TenantWebhook {
  constructor(
    readonly id: string, readonly tenantId: string, readonly name: string,
    readonly endpointUrl: string, readonly secretKey: string | null,
    readonly isActive: boolean, readonly maxRetries: number,
    readonly eventTypes: string[], readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    tenantId: string; name: string; endpointUrl: string; eventTypes?: string[]
    secretKey?: string; maxRetries?: number
  }): TenantWebhook {
    return new TenantWebhook(
      randomUUID(), props.tenantId, props.name, props.endpointUrl,
      props.secretKey ?? null, true, props.maxRetries ?? 3,
      props.eventTypes ?? [], new Date(), new Date(),
    )
  }
}

export class ExchangeRate {
  constructor(
    readonly id: string, readonly tenantId: string,
    readonly fromCurrencyId: string, readonly toCurrencyId: string,
    readonly rate: number, readonly effectiveDate: Date, readonly createdAt: Date,
  ) {}
  static create(props: {
    tenantId: string; fromCurrencyId: string; toCurrencyId: string
    rate: number; effectiveDate?: Date
  }): ExchangeRate {
    return new ExchangeRate(randomUUID(), props.tenantId, props.fromCurrencyId,
      props.toCurrencyId, props.rate, props.effectiveDate ?? new Date(), new Date())
  }
}

export class Translation {
  constructor(
    readonly id: string, readonly tenantId: string, readonly languageId: string,
    readonly translationKey: string, readonly translationValue: string,
    readonly createdAt: Date,
  ) {}
  static create(props: {
    tenantId: string; languageId: string; translationKey: string; translationValue: string
  }): Translation {
    return new Translation(randomUUID(), props.tenantId, props.languageId,
      props.translationKey, props.translationValue, new Date())
  }
}

export class SystemAuditLog {
  constructor(
    readonly id: string, readonly tenantId: string, readonly userId: string | null,
    readonly moduleName: string, readonly actionType: string,
    readonly entityName: string, readonly entityId: string,
    readonly oldValues: Record<string, unknown> | null,
    readonly newValues: Record<string, unknown> | null,
    readonly ipAddress: string | null, readonly userAgent: string | null,
    readonly createdAt: Date,
  ) {}
}

export class SystemParameter {
  constructor(
    readonly paramKey: string, readonly paramValue: string,
    readonly description: string | null, readonly dataType: string,
    readonly isPublic: boolean, readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    paramKey: string; paramValue: string; description?: string
    dataType?: string; isPublic?: boolean
  }): SystemParameter {
    return new SystemParameter(props.paramKey, props.paramValue,
      props.description ?? null, props.dataType ?? 'STRING',
      props.isPublic ?? false, new Date(), new Date())
  }
}
