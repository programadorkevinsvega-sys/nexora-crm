import { pgTable, uuid, varchar, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'

export const processedEvents = pgTable('processed_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: varchar('event_id', { length: 255 }).notNull(),
  eventType: varchar('event_type', { length: 150 }).notNull(),
  consumerGroup: varchar('consumer_group', { length: 100 }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  dedupIdx: uniqueIndex('idx_processed_events_dedup').on(table.eventId, table.consumerGroup),
  eventTypeIdx: index('idx_processed_events_event_type').on(table.eventType),
  processedAtIdx: index('idx_processed_events_processed_at').on(table.processedAt),
}))
