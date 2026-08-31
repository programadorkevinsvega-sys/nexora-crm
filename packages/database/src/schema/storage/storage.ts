import { pgSchema, uuid, varchar, text, integer, bigint, timestamp, jsonb, boolean, primaryKey, index } from 'drizzle-orm/pg-core'

export const storageSchema = pgSchema('storage')

export const files = storageSchema.table('files', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id'),
  originalName: varchar('original_name', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 127 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  storageKey: varchar('storage_key', { length: 1000 }).notNull(),
  bucket: varchar('bucket', { length: 255 }).notNull(),
  uploadedByUserId: uuid('uploaded_by_user_id'),
  entityType: varchar('entity_type', { length: 100 }),
  entityId: uuid('entity_id'),
  metadataJson: jsonb('metadata_json'),
  checksumSha256: varchar('checksum_sha256', { length: 64 }),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  entityIdx: index('idx_storage_files_entity').on(table.entityType, table.entityId),
  storageKeyIdx: index('idx_storage_files_key').on(table.storageKey),
}))

export const storageOutboxEvents = storageSchema.table('outbox_events', {
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
  publishedIdx: index('idx_storage_outbox_published_created').on(table.published, table.createdAt),
  eventTypeIdx: index('idx_storage_outbox_event_type').on(table.eventType),
}))

export const storageEventDeadLetters = storageSchema.table('event_dead_letters', {
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

export const storageInboxEvents = storageSchema.table('inbox_events', {
  eventId: uuid('event_id').notNull(),
  tenantId: uuid('tenant_id'),
  source: varchar('source', { length: 150 }).notNull(),
  handler: varchar('handler', { length: 150 }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.eventId, table.handler] }),
}))
