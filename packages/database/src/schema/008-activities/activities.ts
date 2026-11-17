import { pgTable, uuid, varchar, text, timestamp, boolean, integer, date, numeric, primaryKey } from 'drizzle-orm/pg-core'

export const contactNotes = pgTable('crm_contact_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull(),
  body: text('body').notNull(),
  isFavorite: boolean('is_favorite').default(false),
  favoritedAt: timestamp('favorited_at', { withTimezone: true }),
  createdByUserId: uuid('created_by_user_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const activities = pgTable('crm_activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  activityType: varchar('activity_type', { length: 100 }),
  summary: varchar('summary', { length: 255 }).notNull(),
  description: text('description'),
  happenedAt: date('happened_at').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const activityContacts = pgTable('crm_activity_contacts', {
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').notNull(),
  tenantId: uuid('tenant_id').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.activityId, t.contactId] }),
}))

export const callLogs = pgTable('crm_call_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull(),
  calledAt: timestamp('called_at', { withTimezone: true }).notNull(),
  content: text('content'),
  contactCalledMe: boolean('contact_called_me').notNull().default(false),
  durationSeconds: integer('duration_seconds'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const contactTasks = pgTable('crm_contact_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id'),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  assignedToUserId: uuid('assigned_to_user_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const contactPets = pgTable('crm_contact_pets', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull(),
  petCategory: varchar('pet_category', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  breed: varchar('breed', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
