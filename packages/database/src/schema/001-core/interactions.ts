import { pgTable, uuid, varchar, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core'
import { contacts } from './contacts'
import { companies } from './companies'
import { deals } from './deals'

export const notes = pgTable(
  'notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isPinned: boolean('is_pinned').default(false),
    isPrivate: boolean('is_private').default(false),
    sentiment: varchar('sentiment', { length: 20 }), // 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
    authorUserId: uuid('author_user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantContactIdx: index('idx_notes_tenant_contact').on(table.tenantId, table.contactId, table.createdAt),
    tenantDealIdx: index('idx_notes_tenant_deal').on(table.tenantId, table.dealId),
  }),
)

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    priority: varchar('priority', { length: 20 }).default('MEDIUM'), // 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    taskType: varchar('task_type', { length: 50 }).default('TODO'), // 'CALL' | 'EMAIL' | 'MEETING' | 'FOLLOW_UP' | 'TODO'
    dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
    isCompleted: boolean('is_completed').default(false),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    reminderAt: timestamp('reminder_at', { withTimezone: true }),
    assignedUserId: uuid('assigned_user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantAssignedDueIdx: index('idx_tasks_tenant_assigned_due').on(table.tenantId, table.assignedUserId, table.isCompleted, table.dueDate),
    tenantContactIdx: index('idx_tasks_tenant_contact').on(table.tenantId, table.contactId),
  }),
)

export const calls = pgTable(
  'calls',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
    dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'set null' }),
    callType: varchar('call_type', { length: 50 }).default('OUTBOUND'), // 'INBOUND' | 'OUTBOUND' | 'MEETING'
    phoneNumber: varchar('phone_number', { length: 50 }),
    durationSeconds: integer('duration_seconds'),
    callSid: varchar('call_sid', { length: 255 }),
    recordingUrl: text('recording_url'),
    summary: text('summary'),
    aiSummary: text('ai_summary'),
    sentiment: varchar('sentiment', { length: 30 }),
    happenedAt: timestamp('happened_at', { withTimezone: true }).notNull(),
    authorUserId: uuid('author_user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantContactHappenedIdx: index('idx_calls_tenant_contact_happened').on(table.tenantId, table.contactId, table.happenedAt),
    tenantAuthorIdx: index('idx_calls_tenant_author').on(table.tenantId, table.authorUserId),
  }),
)
