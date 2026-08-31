import { pgTable, uuid, varchar, timestamp, text, boolean, integer, numeric, date, primaryKey } from 'drizzle-orm/pg-core'

export const relationshipTypes = pgTable('crm_relationship_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  reverseName: varchar('reverse_name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const contactRelationships = pgTable('crm_contact_relationships', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull(),
  relatedContactId: uuid('related_contact_id').notNull(),
  relationshipTypeId: uuid('relationship_type_id').notNull().references(() => relationshipTypes.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const lifeEvents = pgTable('crm_life_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  happenedAt: date('happened_at').notNull(),
  isYearlyRecurring: boolean('is_yearly_recurring').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const contactGifts = pgTable('crm_contact_gifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull(),
  direction: varchar('direction', { length: 50 }).default('GIVEN'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  url: text('url'),
  estimatedValue: numeric('estimated_value', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 50 }).default('IDEA'),
  dateGivenOrReceived: date('date_given_or_received'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const contactDebts = pgTable('crm_contact_debts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull(),
  direction: varchar('direction', { length: 50 }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 50 }).default('UNPAID'),
  dueDate: date('due_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const contactReminders = pgTable('crm_contact_reminders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  frequencyType: varchar('frequency_type', { length: 50 }).notNull(),
  frequencyInterval: integer('frequency_interval').default(1),
  nextDueDate: timestamp('next_due_date', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
