import { pgTable, uuid, varchar, text, timestamp, boolean, numeric, index } from 'drizzle-orm/pg-core'

export const discountApprovalRules = pgTable(
  'discount_approval_rules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    minDiscountPct: numeric('min_discount_pct', { precision: 5, scale: 2 }).notNull(),
    maxDiscountPct: numeric('max_discount_pct', { precision: 5, scale: 2 }).notNull(),
    approverRole: varchar('approver_role', { length: 50 }).default('SALES_MANAGER').notNull(), // 'SALES_MANAGER' | 'VP_SALES' | 'CFO'
    requiresStrictApproval: boolean('requires_strict_approval').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('discount_rules_tenant_idx').on(table.tenantId),
  }),
)

export const quoteApprovalRequests = pgTable(
  'quote_approval_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    quoteId: uuid('quote_id').notNull(),
    requestedDiscountPct: numeric('requested_discount_pct', { precision: 5, scale: 2 }).notNull(),
    status: varchar('status', { length: 30 }).default('PENDING').notNull(), // 'PENDING' | 'APPROVED' | 'REJECTED'
    requestedByUserId: uuid('requested_by_user_id'),
    reviewedByUserId: uuid('reviewed_by_user_id'),
    reviewNotes: text('review_notes'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('quote_req_tenant_idx').on(table.tenantId),
    quoteIdx: index('quote_req_quote_idx').on(table.tenantId, table.quoteId),
  }),
)

export const customerQuoteAcceptances = pgTable(
  'customer_quote_acceptances',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    quoteId: uuid('quote_id').notNull(),
    securityToken: varchar('security_token', { length: 255 }).notNull().unique(),
    clientSignerName: varchar('client_signer_name', { length: 255 }),
    clientSignerEmail: varchar('client_signer_email', { length: 255 }),
    clientIpAddress: varchar('client_ip_address', { length: 100 }),
    status: varchar('status', { length: 30 }).default('VIEWED').notNull(), // 'VIEWED' | 'ACCEPTED' | 'REJECTED'
    feedback: text('feedback'),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('quote_acc_tenant_idx').on(table.tenantId),
    tokenIdx: index('quote_acc_token_idx').on(table.securityToken),
  }),
)
