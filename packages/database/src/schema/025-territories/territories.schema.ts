import { pgTable, uuid, varchar, text, timestamp, boolean, numeric, jsonb, integer, index } from 'drizzle-orm/pg-core'

export const salesTerritories = pgTable(
  'sales_territories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    description: text('description'),
    parentTerritoryId: uuid('parent_territory_id'),
    countryCodes: jsonb('country_codes').default([]).notNull(), // e.g. ["CO", "PE", "EC", "MX"]
    regions: jsonb('regions').default([]).notNull(), // e.g. ["Andina", "Cono Sur"]
    industries: jsonb('industries').default([]).notNull(), // e.g. ["FINTECH", "SAAS", "LOGISTICS"]
    minEmployeeCount: integer('min_employee_count').default(1),
    maxEmployeeCount: integer('max_employee_count'),
    managerUserId: uuid('manager_user_id'),
    quotaTargetUsd: numeric('quota_target_usd', { precision: 14, scale: 2 }).default('100000.00').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('sales_territories_tenant_idx').on(table.tenantId),
    codeIdx: index('sales_territories_code_idx').on(table.tenantId, table.code),
    activeIdx: index('sales_territories_active_idx').on(table.tenantId, table.isActive),
  }),
)

export const territoryMembers = pgTable(
  'territory_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    territoryId: uuid('territory_id').notNull(),
    userId: uuid('user_id').notNull(),
    role: varchar('role', { length: 50 }).default('ACCOUNT_EXEC').notNull(), // 'PRIMARY_LEAD' | 'ACCOUNT_EXEC' | 'SDR' | 'SPECIALIST'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('territory_members_tenant_idx').on(table.tenantId),
    territoryIdx: index('territory_members_territory_idx').on(table.tenantId, table.territoryId),
    userIdx: index('territory_members_user_idx').on(table.tenantId, table.userId),
  }),
)
