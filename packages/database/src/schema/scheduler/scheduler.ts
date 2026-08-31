import { pgSchema, uuid, varchar, text, integer, bigint, timestamp, jsonb, boolean, primaryKey, index } from 'drizzle-orm/pg-core'

export const schedulerSchema = pgSchema('scheduler')

export const scheduledTasks = schedulerSchema.table('scheduled_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  cronExpression: varchar('cron_expression', { length: 100 }).notNull(),
  taskType: varchar('task_type', { length: 100 }).notNull(),
  targetService: varchar('target_service', { length: 150 }),
  targetEndpoint: varchar('target_endpoint', { length: 500 }),
  targetPayload: jsonb('target_payload'),
  enabled: boolean('enabled').default(true).notNull(),
  maxRetries: integer('max_retries').default(3).notNull(),
  timeoutSeconds: integer('timeout_seconds').default(300),
  createdByUserId: uuid('created_by_user_id'),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  nextRunAt: timestamp('next_run_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nextRunIdx: index('idx_sched_tasks_next_run').on(table.enabled, table.nextRunAt),
  taskTypeIdx: index('idx_sched_tasks_type').on(table.taskType),
}))

export const taskExecutions = schedulerSchema.table('task_executions', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull(),
  tenantId: uuid('tenant_id'),
  status: varchar('status', { length: 50 }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  resultPayload: jsonb('result_payload'),
  errorMessage: text('error_message'),
  attemptNumber: integer('attempt_number').default(1).notNull(),
}, (table) => ({
  taskStartedIdx: index('idx_sched_exec_task_started').on(table.taskId, table.startedAt),
}))

export const reminders = schedulerSchema.table('reminders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id'),
  userId: uuid('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  entityType: varchar('entity_type', { length: 100 }),
  entityId: uuid('entity_id'),
  remindAt: timestamp('remind_at', { withTimezone: true }).notNull(),
  reminded: boolean('reminded').default(false).notNull(),
  notified: boolean('notified').default(false).notNull(),
  repeatInterval: varchar('repeat_interval', { length: 50 }),
  repeatCount: integer('repeat_count'),
  repeatRemaining: integer('repeat_remaining'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  remindDueIdx: index('idx_sched_reminders_due').on(table.tenantId, table.remindAt),
}))

export const slaConfigs = schedulerSchema.table('sla_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  conditionField: varchar('condition_field', { length: 100 }),
  conditionOperator: varchar('condition_operator', { length: 50 }),
  conditionValue: varchar('condition_value', { length: 500 }),
  responseTimeMinutes: integer('response_time_minutes').notNull(),
  resolutionTimeMinutes: integer('resolution_time_minutes'),
  escalationUserId: uuid('escalation_user_id'),
  escalationEmail: varchar('escalation_email', { length: 255 }),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const slaViolations = schedulerSchema.table('sla_violations', {
  id: uuid('id').defaultRandom().primaryKey(),
  slaConfigId: uuid('sla_config_id').notNull(),
  tenantId: uuid('tenant_id').notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  violationType: varchar('violation_type', { length: 50 }).notNull(),
  detectedAt: timestamp('detected_at', { withTimezone: true }).defaultNow().notNull(),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  escalatedAt: timestamp('escalated_at', { withTimezone: true }),
  status: varchar('status', { length: 50 }).default('open').notNull(),
  notes: text('notes'),
}, (table) => ({
  entityIdx: index('idx_sched_sla_violations_entity').on(table.entityType, table.entityId),
  configIdx: index('idx_sched_sla_violations_config').on(table.slaConfigId),
}))

export const schedulerOutboxEvents = schedulerSchema.table('outbox_events', {
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
  publishedIdx: index('idx_sched_outbox_published_created').on(table.published, table.createdAt),
  eventTypeIdx: index('idx_sched_outbox_event_type').on(table.eventType),
}))

export const schedulerEventDeadLetters = schedulerSchema.table('event_dead_letters', {
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

export const schedulerInboxEvents = schedulerSchema.table('inbox_events', {
  eventId: uuid('event_id').notNull(),
  tenantId: uuid('tenant_id'),
  source: varchar('source', { length: 150 }).notNull(),
  handler: varchar('handler', { length: 150 }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.eventId, table.handler] }),
}))
