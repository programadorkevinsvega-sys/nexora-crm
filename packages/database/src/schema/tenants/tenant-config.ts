import { tenantsSchema } from './tenants'
import { uuid, varchar, text, boolean, integer, numeric, timestamp, jsonb, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core'

export const tenantLanguages = tenantsSchema.table('tenant_languages', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  isoCode: varchar('iso_code', { length: 10 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTenantLanguage: uniqueIndex('idx_tenant_languages_tenant_iso').on(table.tenantId, table.isoCode),
}))

export const tenantTranslations = tenantsSchema.table('tenant_translations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  languageId: uuid('language_id').notNull(),
  translationKey: varchar('translation_key', { length: 255 }).notNull(),
  translationValue: text('translation_value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTenantLangKey: uniqueIndex('idx_tenant_translations_key').on(table.tenantId, table.languageId, table.translationKey),
}))

export const tenantCurrencies = tenantsSchema.table('tenant_currencies', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  isoCode: varchar('iso_code', { length: 3 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  isBaseCurrency: boolean('is_base_currency').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTenantCurrency: uniqueIndex('idx_tenant_currencies_tenant_iso').on(table.tenantId, table.isoCode),
}))

export const tenantExchangeRates = tenantsSchema.table('tenant_exchange_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  fromCurrencyId: uuid('from_currency_id').notNull(),
  toCurrencyId: uuid('to_currency_id').notNull(),
  rate: numeric('rate', { precision: 15, scale: 6 }).notNull(),
  effectiveDate: timestamp('effective_date', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const tenantApiKeys = tenantsSchema.table('tenant_api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  lastFourChars: varchar('last_four_chars', { length: 4 }).notNull(),
  scopesJson: jsonb('scopes_json').notNull().default([]),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const tenantWebhooks = tenantsSchema.table('tenant_webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  endpointUrl: text('endpoint_url').notNull(),
  secretKey: varchar('secret_key', { length: 255 }),
  isActive: boolean('is_active').default(true),
  maxRetries: integer('max_retries').default(3),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const tenantWebhookEvents = tenantsSchema.table('tenant_webhook_events', {
  webhookId: uuid('webhook_id').notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.webhookId, table.eventType] }),
}))

export const tenantWebhookDeliveryLogs = tenantsSchema.table('tenant_webhook_delivery_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  webhookId: uuid('webhook_id').notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payloadJson: jsonb('payload_json').notNull(),
  attemptNumber: integer('attempt_number').default(1),
  responseStatusCode: integer('response_status_code'),
  responseBody: text('response_body'),
  status: varchar('status', { length: 50 }).default('PENDING'),
  executedAt: timestamp('executed_at', { withTimezone: true }).defaultNow().notNull(),
})

export const tenantSystemAuditLogs = tenantsSchema.table('tenant_system_audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id'),
  moduleName: varchar('module_name', { length: 100 }).notNull(),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  entityName: varchar('entity_name', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  oldValuesJson: jsonb('old_values_json'),
  newValuesJson: jsonb('new_values_json'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
