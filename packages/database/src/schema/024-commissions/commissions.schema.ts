import { pgTable, uuid, varchar, text, timestamp, boolean, numeric, jsonb, index } from 'drizzle-orm/pg-core'

export const commissionPlans = pgTable(
  'commission_plans',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    calculationModel: varchar('calculation_model', { length: 50 }).default('FLAT_PERCENTAGE').notNull(), // 'FLAT_PERCENTAGE' | 'TIERED_QUOTA' | 'ACCELERATOR'
    baseRate: numeric('base_rate', { precision: 5, scale: 2 }).default('5.00').notNull(), // e.g. 5.00%
    tierRules: jsonb('tier_rules').default([]).notNull(), // [{ minQuotaPct: 100, rate: 8.0 }, { minQuotaPct: 120, rate: 12.0 }]
    acceleratorRate: numeric('accelerator_rate', { precision: 5, scale: 2 }).default('8.00'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('commission_plans_tenant_idx').on(table.tenantId),
    activeIdx: index('commission_plans_active_idx').on(table.tenantId, table.isActive),
  }),
)

export const commissionRecords = pgTable(
  'commission_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    planId: uuid('plan_id'),
    dealId: uuid('deal_id').notNull(),
    userId: uuid('user_id').notNull(),
    dealValue: numeric('deal_value', { precision: 14, scale: 2 }).notNull(),
    commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }).notNull(),
    commissionAmount: numeric('commission_amount', { precision: 14, scale: 2 }).notNull(),
    splitPercentage: numeric('split_percentage', { precision: 5, scale: 2 }).default('100.00').notNull(),
    status: varchar('status', { length: 30 }).default('PENDING').notNull(), // 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'
    period: varchar('period', { length: 7 }).notNull(), // 'YYYY-MM'
    approvedByUserId: uuid('approved_by_user_id'),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('commission_records_tenant_idx').on(table.tenantId),
    userIdx: index('commission_records_user_idx').on(table.tenantId, table.userId),
    dealIdx: index('commission_records_deal_idx').on(table.tenantId, table.dealId),
    statusIdx: index('commission_records_status_idx').on(table.tenantId, table.status),
  }),
)
