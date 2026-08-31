import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core'
import { contacts } from './contacts'

export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 50 }).default('OPEN'),
  priority: varchar('priority', { length: 50 }).default('MEDIUM'),
  assignedUserId: uuid('assigned_user_id'),
  slaId: uuid('sla_id'),
  firstResponseAt: timestamp('first_response_at', { withTimezone: true }),
  slaBreachAt: timestamp('sla_breach_at', { withTimezone: true }),
  isEscalated: timestamp('is_escalated', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tenantStatusPriorityIdx: index('idx_tickets_tenant_status_prio').on(table.tenantId, table.status, table.priority, table.createdAt),
  tenantAssignedIdx: index('idx_tickets_tenant_assigned').on(table.tenantId, table.assignedUserId),
  tenantContactIdx: index('idx_tickets_tenant_contact').on(table.tenantId, table.contactId),
}))
