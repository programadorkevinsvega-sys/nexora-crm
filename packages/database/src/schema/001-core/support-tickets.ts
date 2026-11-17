import { pgTable, uuid, varchar, text, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { contacts } from './contacts'
import { companies } from './companies'

export const supportTickets = pgTable(
  'support_tickets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
    subject: varchar('subject', { length: 255 }).notNull(),
    description: text('description').notNull(),
    status: varchar('status', { length: 50 }).default('OPEN'), // 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED'
    priority: varchar('priority', { length: 50 }).default('MEDIUM'), // 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    channel: varchar('channel', { length: 50 }).default('PORTAL'), // 'EMAIL' | 'WHATSAPP' | 'PORTAL' | 'PHONE'
    assignedUserId: uuid('assigned_user_id'),
    slaId: uuid('sla_id'),
    slaPolicyId: uuid('sla_policy_id'),
    firstResponseAt: timestamp('first_response_at', { withTimezone: true }),
    slaBreachAt: timestamp('sla_breach_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    isEscalated: timestamp('is_escalated', { withTimezone: true }),
    escalationLevel: integer('escalation_level').default(1),
    csatScore: integer('csat_score'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantStatusPriorityIdx: index('idx_tickets_tenant_status_prio').on(table.tenantId, table.status, table.priority, table.createdAt),
    tenantAssignedIdx: index('idx_tickets_tenant_assigned').on(table.tenantId, table.assignedUserId),
    tenantContactIdx: index('idx_tickets_tenant_contact').on(table.tenantId, table.contactId),
    tenantCompanyIdx: index('idx_tickets_tenant_company').on(table.tenantId, table.companyId),
  }),
)
