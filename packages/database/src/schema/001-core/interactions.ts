import { pgTable, uuid, varchar, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core'
import { contacts } from './contacts'
import { companies } from './companies'
import { deals } from './deals'

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  authorUserId: uuid('author_user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tenantContactIdx: index('idx_notes_tenant_contact').on(table.tenantId, table.contactId, table.createdAt),
  tenantDealIdx: index('idx_notes_tenant_deal').on(table.tenantId, table.dealId),
}))

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  isCompleted: boolean('is_completed').default(false),
  assignedUserId: uuid('assigned_user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tenantAssignedDueIdx: index('idx_tasks_tenant_assigned_due').on(table.tenantId, table.assignedUserId, table.isCompleted, table.dueDate),
  tenantContactIdx: index('idx_tasks_tenant_contact').on(table.tenantId, table.contactId),
}))

export const calls = pgTable('calls', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  callType: varchar('call_type', { length: 50 }).default('OUTBOUND'),
  durationSeconds: integer('duration_seconds'),
  summary: text('summary'),
  happenedAt: timestamp('happened_at', { withTimezone: true }).notNull(),
  authorUserId: uuid('author_user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tenantContactHappenedIdx: index('idx_calls_tenant_contact_happened').on(table.tenantId, table.contactId, table.happenedAt),
  tenantAuthorIdx: index('idx_calls_tenant_author').on(table.tenantId, table.authorUserId),
}))
