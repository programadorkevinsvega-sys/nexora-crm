import { pgSchema, uuid, varchar, text, boolean, integer, timestamp, jsonb, primaryKey, index } from 'drizzle-orm/pg-core'

export const auditSchema = pgSchema('audit')

export const auditLogs = auditSchema.table('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id'),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  fieldName: varchar('field_name', { length: 100 }),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changedByUserId: uuid('changed_by_user_id'),
  moduleName: varchar('module_name', { length: 100 }),
  correlationId: varchar('correlation_id', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  metadataJson: jsonb('metadata_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tenantCreatedIdx: index('idx_audit_logs_tenant_created').on(table.tenantId, table.createdAt),
  entityIdx: index('idx_audit_logs_entity').on(table.entityType, table.entityId, table.createdAt),
  moduleIdx: index('idx_audit_logs_module').on(table.tenantId, table.moduleName),
}))

export const auditOutboxEvents = auditSchema.table('outbox_events', {
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
  publishedIdx: index('idx_audit_outbox_published_created').on(table.published, table.createdAt),
  eventTypeIdx: index('idx_audit_outbox_event_type').on(table.eventType),
}))

export const auditEventDeadLetters = auditSchema.table('event_dead_letters', {
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

export const auditInboxEvents = auditSchema.table('inbox_events', {
  eventId: uuid('event_id').notNull(),
  tenantId: uuid('tenant_id'),
  source: varchar('source', { length: 150 }).notNull(),
  handler: varchar('handler', { length: 150 }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.eventId, table.handler] }),
}))
