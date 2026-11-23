import { sql } from 'drizzle-orm'
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  jsonb,
  uniqueIndex,
  index,
  check,
  foreignKey,
} from 'drizzle-orm/pg-core'
import { tenants } from '../tenants/tenants'

export const workflowDefinitions = pgTable(
  'workflow_definitions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    version: integer('version').default(1).notNull(),
    status: varchar('status', { length: 50 }).default('DRAFT').notNull(),
    triggerEvent: varchar('trigger_event', { length: 150 }).notNull(),
    triggerFilter: jsonb('trigger_filter'),
    stepsGraph: jsonb('steps_graph').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantNameVerIdx: uniqueIndex('workflow_definitions_tenant_name_ver_idx').on(table.tenantId, table.name, table.version),
    tenantIdVersionIdx: uniqueIndex('workflow_definitions_tenant_id_version_unique').on(table.tenantId, table.id, table.version),
    tenantStatusEventIdx: index('workflow_definitions_tenant_status_event_idx').on(table.tenantId, table.status, table.triggerEvent),
    tenantIdFk: foreignKey({
      name: 'workflow_definitions_tenant_id_fk',
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete('restrict'),
    statusCheck: check(
      'workflow_definitions_status_check',
      sql`${table.status} IN ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED')`,
    ),
    versionCheck: check('workflow_definitions_version_check', sql`${table.version} > 0`),
  }),
)

export const workflowExecutions = pgTable(
  'workflow_executions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'restrict' }),
    workflowId: uuid('workflow_id').notNull(),
    version: integer('version').notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    status: varchar('status', { length: 50 }).default('RUNNING').notNull(),
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
    tenantIdIdx: uniqueIndex('workflow_executions_tenant_id_unique').on(table.tenantId, table.id),
    tenantIdFk: foreignKey({
      name: 'workflow_executions_tenant_id_fk',
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete('restrict'),
    workflowVersionFk: foreignKey({
      name: 'workflow_executions_tenant_workflow_version_fk',
      columns: [table.tenantId, table.workflowId, table.version],
      foreignColumns: [workflowDefinitions.tenantId, workflowDefinitions.id, workflowDefinitions.version],
    }).onDelete('restrict'),
    statusCheck: check(
      'workflow_executions_status_check',
      sql`${table.status} IN ('RUNNING', 'WAITING_DELAY', 'COMPLETED', 'CANCELLED', 'FAILED')`,
    ),
    versionCheck: check('workflow_executions_version_check', sql`${table.version} > 0`),
  }),
)

export const workflowStepExecutions = pgTable(
  'workflow_step_executions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'restrict' }),
    executionId: uuid('execution_id').notNull(),
    stepId: varchar('step_id', { length: 100 }).notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).default('PENDING').notNull(),
    attempts: integer('attempts').default(1).notNull(),
    outputData: jsonb('output_data'),
    errorMessage: text('error_message'),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    idempotencyIdx: uniqueIndex('workflow_step_executions_idempotency_idx').on(table.tenantId, table.idempotencyKey),
    executionIdx: index('workflow_step_executions_execution_idx').on(table.tenantId, table.executionId),
    executionTenantFk: foreignKey({
      name: 'workflow_step_executions_tenant_execution_fk',
      columns: [table.tenantId, table.executionId],
      foreignColumns: [workflowExecutions.tenantId, workflowExecutions.id],
    }).onDelete('restrict'),
    tenantIdFk: foreignKey({
      name: 'workflow_step_executions_tenant_id_fk',
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
    }).onDelete('restrict'),
    statusCheck: check(
      'workflow_step_executions_status_check',
      sql`${table.status} IN ('PENDING', 'EXECUTING', 'SUCCESS', 'FAILED', 'SKIPPED')`,
    ),
    attemptsCheck: check('workflow_step_executions_attempts_check', sql`${table.attempts} > 0`),
    idempotencyKeyCheck: check(
      'workflow_step_executions_idempotency_key_check',
      sql`${table.idempotencyKey} = ${table.executionId}::text || '_' || ${table.stepId} || '_' || ${table.attempts}::text`,
    ),
  }),
)
