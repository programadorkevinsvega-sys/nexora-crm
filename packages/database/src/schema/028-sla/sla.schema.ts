import { pgTable, uuid, varchar, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core'

export const slaPolicies = pgTable(
  'sla_policies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    priority: varchar('priority', { length: 50 }).default('HIGH').notNull(), // 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL'
    firstResponseTimeMinutes: integer('first_response_time_minutes').default(60).notNull(), // e.g. 15 min, 60 min
    resolutionTimeMinutes: integer('resolution_time_minutes').default(240).notNull(), // e.g. 120 min, 480 min
    businessHoursOnly: boolean('business_hours_only').default(true).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('sla_policies_tenant_idx').on(table.tenantId),
    priorityIdx: index('sla_policies_priority_idx').on(table.tenantId, table.priority),
  }),
)

export const slaEscalationRules = pgTable(
  'sla_escalation_rules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    policyId: uuid('policy_id').notNull(),
    level: integer('level').default(1).notNull(), // 1, 2, 3
    triggerAfterMinutes: integer('trigger_after_minutes').notNull(),
    actionType: varchar('action_type', { length: 50 }).default('NOTIFY_MANAGER').notNull(), // 'NOTIFY_MANAGER' | 'REASSIGN_TEAM' | 'PAGE_ON_CALL' | 'RAISE_PRIORITY'
    targetUserId: uuid('target_user_id'),
    targetTeamId: uuid('target_team_id'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('sla_rules_tenant_idx').on(table.tenantId),
    policyIdx: index('sla_rules_policy_idx').on(table.tenantId, table.policyId),
  }),
)

export const ticketSlaTrackers = pgTable(
  'ticket_sla_trackers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    ticketId: uuid('ticket_id').notNull(),
    policyId: uuid('policy_id').notNull(),
    firstResponseDueAt: timestamp('first_response_due_at', { withTimezone: true }).notNull(),
    firstRespondedAt: timestamp('first_responded_at', { withTimezone: true }),
    resolutionDueAt: timestamp('resolution_due_at', { withTimezone: true }).notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    isFirstResponseBreached: boolean('is_first_response_breached').default(false).notNull(),
    isResolutionBreached: boolean('is_resolution_breached').default(false).notNull(),
    escalationLevelReached: integer('escalation_level_reached').default(0).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('sla_trackers_tenant_idx').on(table.tenantId),
    ticketIdx: index('sla_trackers_ticket_idx').on(table.tenantId, table.ticketId),
  }),
)
