import { pgTable, uuid, varchar, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core'

export const outboxEvents = pgTable('outbox_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  aggregateType: varchar('aggregate_type', { length: 100 }).notNull(),
  aggregateId: uuid('aggregate_id').notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  publishedIdx: index('idx_outbox_published_created').on(table.published, table.createdAt),
  aggregateIdx: index('idx_outbox_aggregate').on(table.aggregateType, table.aggregateId),
}))
