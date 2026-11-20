import { sql } from 'drizzle-orm'
import { index, pgSchema, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

export const customerPortalSchema = pgSchema('customer_portal')

export const customerPortalInvitations = customerPortalSchema.table('invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  invitedBy: uuid('invited_by').notNull(),
  tokenHash: varchar('token_hash', { length: 64 }),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tokenUnique: uniqueIndex('idx_customer_portal_invitation_token').on(table.tokenHash)
    .where(sql`${table.tokenHash} IS NOT NULL`),
  activeContact: uniqueIndex('idx_customer_portal_invitation_active_contact')
    .on(table.tenantId, table.contactId)
    .where(sql`${table.status} = 'PENDING'`),
  tenantStatus: index('idx_customer_portal_invitation_tenant_status')
    .on(table.tenantId, table.status, table.createdAt),
}))

export const customerPortalAccounts = customerPortalSchema.table('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }).notNull(),
  refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tenantContact: uniqueIndex('idx_customer_portal_account_tenant_contact').on(table.tenantId, table.contactId),
  tenantEmail: uniqueIndex('idx_customer_portal_account_tenant_email').on(table.tenantId, table.email),
  tenantStatus: index('idx_customer_portal_account_tenant_status').on(table.tenantId, table.status),
}))
