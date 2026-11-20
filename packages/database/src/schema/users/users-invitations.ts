import { index, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

import { usersSchema } from './users'

export const userMemberInvitations = usersSchema.table('tenant_member_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  roleId: uuid('role_id').notNull(),
  invitedBy: uuid('invited_by').notNull(),
  tokenHash: varchar('token_hash', { length: 64 }),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  acceptedUserId: uuid('accepted_user_id'),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tokenHashUnique: uniqueIndex('idx_user_member_invitation_token_hash').on(table.tokenHash),
  oneActiveInvitationPerEmail: uniqueIndex('idx_user_member_invitation_active_email')
    .on(table.tenantId, table.email)
    .where(sql`${table.status} in ('PENDING', 'ACCEPTING')`),
  tenantStatusCreated: index('idx_user_member_invitation_tenant_status_created')
    .on(table.tenantId, table.status, table.createdAt),
}))
