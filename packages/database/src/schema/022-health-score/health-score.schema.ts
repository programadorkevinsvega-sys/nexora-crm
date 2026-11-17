import { pgTable, uuid, varchar, text, timestamp, integer, numeric, index } from 'drizzle-orm/pg-core'

export const customerHealthScores = pgTable(
  'customer_health_scores',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    contactId: uuid('contact_id'),
    companyId: uuid('company_id'),
    healthScore: integer('health_score').notNull(), // 0 - 100
    status: varchar('status', { length: 20 }).default('HEALTHY').notNull(), // 'HEALTHY' | 'NEUTRAL' | 'AT_RISK' | 'CRITICAL'
    engagementScore: integer('engagement_score').default(25).notNull(),
    supportScore: integer('support_score').default(20).notNull(),
    financialScore: integer('financial_score').default(20).notNull(),
    recencyScore: integer('recency_score').default(15).notNull(),
    churnProbability: numeric('churn_probability', { precision: 5, scale: 2 }).default('10.00').notNull(),
    primaryRiskFactor: text('primary_risk_factor'),
    recommendedAction: text('recommended_action'),
    lastCalculatedAt: timestamp('last_calculated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('health_scores_tenant_idx').on(table.tenantId),
    contactIdx: index('health_scores_contact_idx').on(table.tenantId, table.contactId),
    companyIdx: index('health_scores_company_idx').on(table.tenantId, table.companyId),
    statusIdx: index('health_scores_status_idx').on(table.tenantId, table.status),
  }),
)
