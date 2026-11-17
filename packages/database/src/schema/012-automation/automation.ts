import { pgTable, uuid, varchar, timestamp, text, integer, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core'

export const workflowDefinitions = pgTable(
  'workflow_definitions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    version: integer('version').default(1).notNull(),
    status: varchar('status', { length: 50 }).default('DRAFT').notNull(), // DRAFT, ACTIVE, PAUSED, ARCHIVED
    triggerEvent: varchar('trigger_event', { length: 150 }).notNull(), // e.g. crm.contact.created
    triggerFilter: jsonb('trigger_filter'),
    stepsGraph: jsonb('steps_graph').notNull(), // Node tree: actions, delays, conditions, branches
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantNameVerIdx: uniqueIndex('workflow_definitions_tenant_name_ver_idx').on(table.tenantId, table.name, table.version),
    tenantStatusEventIdx: index('workflow_definitions_tenant_status_event_idx').on(table.tenantId, table.status, table.triggerEvent),
  }),
)

export const workflowExecutions = pgTable(
  'workflow_executions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    workflowId: uuid('workflow_id').notNull().references(() => workflowDefinitions.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(), // contact, deal, ticket, quote
    entityId: uuid('entity_id').notNull(),
    status: varchar('status', { length: 50 }).default('RUNNING').notNull(), // RUNNING, WAITING_DELAY, COMPLETED, CANCELLED, FAILED
    currentStepId: varchar('current_step_id', { length: 100 }).notNull(),
    contextData: jsonb('context_data'),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    errorMessage: text('error_message'),
  },
  (table) => ({
    tenantStatusIdx: index('workflow_executions_tenant_status_idx').on(table.tenantId, table.status),
    entityIdx: index('workflow_executions_entity_idx').on(table.tenantId, table.entityType, table.entityId),
  }),
)

export const workflowStepExecutions = pgTable(
  'workflow_step_executions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    executionId: uuid('execution_id').notNull().references(() => workflowExecutions.id, { onDelete: 'cascade' }),
    stepId: varchar('step_id', { length: 100 }).notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).default('PENDING').notNull(), // PENDING, EXECUTING, SUCCESS, FAILED, SKIPPED
    attempts: integer('attempts').default(1).notNull(),
    outputData: jsonb('output_data'),
    errorMessage: text('error_message'),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    idempotencyIdx: uniqueIndex('workflow_step_executions_idempotency_idx').on(table.tenantId, table.idempotencyKey),
    executionIdx: index('workflow_step_executions_execution_idx').on(table.tenantId, table.executionId),
  }),
)
