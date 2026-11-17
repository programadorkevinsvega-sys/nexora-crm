import { pgTable, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core'

export const biReports = pgTable(
  'bi_reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 50 }).default('EXECUTIVE').notNull(), // 'SALES' | 'MARKETING' | 'SUPPORT' | 'FINANCE' | 'EXECUTIVE'
    embedType: varchar('embed_type', { length: 30 }).default('POWER_BI_WEB').notNull(), // 'POWER_BI_EMBED' | 'POWER_BI_WEB' | 'CUSTOM_IFRAME'
    embedUrl: text('embed_url').notNull(),
    reportId: varchar('report_id', { length: 255 }),
    workspaceId: varchar('workspace_id', { length: 255 }),
    refreshSchedule: varchar('refresh_schedule', { length: 50 }).default('HOURLY').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('bi_reports_tenant_idx').on(table.tenantId),
    categoryIdx: index('bi_reports_category_idx').on(table.tenantId, table.category),
  }),
)
