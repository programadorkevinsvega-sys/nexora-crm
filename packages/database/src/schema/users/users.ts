import { pgSchema, uuid, varchar, text, boolean, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const usersSchema = pgSchema('users')

export const users = usersSchema.table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  profileId: uuid('profile_id').notNull(),
  profileType: varchar('profile_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).default('ACTIVE'),
  isEmailVerified: boolean('is_email_verified').default(false),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  managerId: uuid('manager_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTenantEmail: uniqueIndex('idx_users_tenant_email').on(table.tenantId, table.email),
}))

export const naturalPersonProfiles = usersSchema.table('natural_person_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  identificationNumber: varchar('identification_number', { length: 50 }),
  phone: varchar('phone', { length: 50 }),
  countryCode: varchar('country_code', { length: 5 }),
  preferredLanguage: varchar('preferred_language', { length: 5 }).default('es'),
  timezone: varchar('timezone', { length: 100 }).default('America/Bogota'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const legalEntityProfiles = usersSchema.table('legal_entity_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  legalName: varchar('legal_name', { length: 255 }).notNull(),
  commercialName: varchar('commercial_name', { length: 255 }),
  taxId: varchar('tax_id', { length: 50 }).notNull(),
  legalAddress: text('legal_address'),
  countryCode: varchar('country_code', { length: 5 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const userOauthLinks = usersSchema.table('user_oauth_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  providerName: varchar('provider_name', { length: 50 }).notNull(),
  providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueProviderUser: uniqueIndex('idx_user_oauth_provider').on(table.providerName, table.providerUserId),
}))

export const userMobileDevices = usersSchema.table('user_mobile_devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id').notNull(),
  deviceIdentifier: varchar('device_identifier', { length: 255 }).notNull(),
  platform: varchar('platform', { length: 50 }).notNull(),
  deviceModel: varchar('device_model', { length: 100 }),
  osVersion: varchar('os_version', { length: 50 }),
  pushNotificationToken: text('push_notification_token'),
  isTrustedDevice: boolean('is_trusted_device').default(false),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueUserDevice: uniqueIndex('idx_user_mobile_devices_user_device').on(table.userId, table.deviceIdentifier),
}))
