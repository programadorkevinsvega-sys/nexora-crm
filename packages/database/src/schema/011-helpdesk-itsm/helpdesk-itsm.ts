import { pgTable, uuid, varchar, timestamp, boolean, integer, numeric, jsonb, text } from 'drizzle-orm/pg-core'
import { helpdeskConversations } from '../006-helpdesk-inbox/helpdesk-inbox'

export const ticketStatuses = pgTable('crm_helpdesk_ticket_statuses', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  colorHex: varchar('color_hex', { length: 20 }).default('#3498db'),
  isClosedState: boolean('is_closed_state').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const ticketPriorities = pgTable('crm_helpdesk_ticket_priorities', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  level: integer('level').default(1),
  colorHex: varchar('color_hex', { length: 20 }).default('#3498db'),
  slaResolutionHours: integer('sla_resolution_hours'),
  slaFirstResponseHours: integer('sla_first_response_hours'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const ticketCategories = pgTable('crm_helpdesk_ticket_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  colorHex: varchar('color_hex', { length: 20 }).default('#3498db'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const agentProfiles = pgTable('crm_helpdesk_agent_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id').notNull().unique(),
  isAvailable: boolean('is_available').default(true),
  agentStatus: varchar('agent_status', { length: 50 }).default('AVAILABLE'),
  assignedCategoriesJson: jsonb('assigned_categories_json').default([]),
  activeTicketsCount: integer('active_tickets_count').default(0),
  resolvedTicketsCount: integer('resolved_tickets_count').default(0),
  averageResolutionHours: numeric('average_resolution_hours', { precision: 8, scale: 2 }),
  averageFirstResponseHours: numeric('average_first_response_hours', { precision: 8, scale: 2 }),
  lastAssignedAt: timestamp('last_assigned_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const ticketAudits = pgTable('crm_helpdesk_ticket_audits', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  conversationId: uuid('conversation_id').notNull().references(() => helpdeskConversations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id'),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  detailsJson: jsonb('details_json').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
