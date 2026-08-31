import { authSchema } from './auth'
import { uuid, varchar, text, boolean, integer, timestamp, jsonb, primaryKey, index } from 'drizzle-orm/pg-core'

export const authOutboxEvents = authSchema.table('outbox_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  aggregateType: varchar('aggregate_type', { length: 100 }).notNull(),
  aggregateId: uuid('aggregate_id').notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  published: boolean('published').default(false),
  attempts: integer('attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
  lastError: text('last_error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  publishedIdx: index('idx_auth_outbox_published_created').on(table.published, table.createdAt),
  eventTypeIdx: index('idx_auth_outbox_event_type').on(table.eventType),
}))

export const authEventDeadLetters = authSchema.table('event_dead_letters', {
  id: uuid('id').defaultRandom().primaryKey(),
  outboxEventId: uuid('outbox_event_id').notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  reason: text('reason').notNull(),
  payload: jsonb('payload').notNull(),
  attempts: integer('attempts').notNull().default(0),
  sourceService: varchar('source_service', { length: 150 }),
  eventType: varchar('event_type', { length: 150 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const authInboxEvents = authSchema.table('inbox_events', {
  eventId: uuid('event_id').notNull(),
  tenantId: uuid('tenant_id'),
  source: varchar('source', { length: 150 }).notNull(),
  handler: varchar('handler', { length: 150 }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.eventId, table.handler] }),
}))
