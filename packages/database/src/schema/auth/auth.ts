import { pgSchema, uuid, varchar, text, boolean, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const authSchema = pgSchema('auth')

export const mfaMethods = authSchema.table('mfa_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  secret: varchar('secret', { length: 255 }).notNull(),
  isPrimary: boolean('is_primary').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const mfaRecoveryCodes = authSchema.table('mfa_recovery_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  codeHash: varchar('code_hash', { length: 255 }).notNull(),
  isUsed: boolean('is_used').default(false),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const sessions = authSchema.table('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id').notNull(),
  refreshTokenHash: varchar('refresh_token_hash', { length: 255 }).notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  deviceId: varchar('device_id', { length: 255 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isRevoked: boolean('is_revoked').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const ipRestrictions = authSchema.table('ip_restrictions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id'),
  ipAddress: varchar('ip_address', { length: 50 }).notNull(),
  type: varchar('type', { length: 20 }).default('ALLOW'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const oauthProviders = authSchema.table('oauth_providers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  providerName: varchar('provider_name', { length: 50 }).notNull(),
  clientId: varchar('client_id', { length: 255 }).notNull(),
  clientSecret: varchar('client_secret', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTenantProvider: uniqueIndex('idx_oauth_providers_tenant_provider').on(table.tenantId, table.providerName),
}))

export const passwordPolicies = authSchema.table('password_policies', {
  tenantId: uuid('tenant_id').primaryKey(),
  minLength: integer('min_length').default(8),
  requireUppercase: boolean('require_uppercase').default(true),
  requireNumbers: boolean('require_numbers').default(true),
  requireSymbols: boolean('require_symbols').default(true),
  expireDays: integer('expire_days').default(90),
  preventReuseLastN: integer('prevent_reuse_last_n').default(3),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const passwordHistory = authSchema.table('password_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
