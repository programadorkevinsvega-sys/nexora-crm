import { pgTable, uuid, varchar, integer, numeric, timestamp, boolean, jsonb, date, primaryKey, text, unique } from 'drizzle-orm/pg-core'

export const loyaltyProfiles = pgTable('crm_loyalty_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull().unique(),
  loyaltyPointsBalance: integer('loyalty_points_balance').default(0),
  tierLevel: varchar('tier_level', { length: 50 }).default('BRONZE'),
  totalLifetimeValue: numeric('total_lifetime_value', { precision: 15, scale: 2 }).default('0'),
  totalPurchasesCount: integer('total_purchases_count').default(0),
  averageOrderValue: numeric('average_order_value', { precision: 15, scale: 2 }).default('0'),
  lastPurchaseDate: date('last_purchase_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const customerSegments = pgTable('crm_customer_segments', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isDynamic: boolean('is_dynamic').default(false),
  rulesJson: jsonb('rules_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const segmentAssignments = pgTable('crm_segment_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  segmentId: uuid('segment_id').notNull().references(() => customerSegments.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').notNull(),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniq: unique().on(t.segmentId, t.contactId),
}))

export const productPreferences = pgTable('crm_product_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull(),
  categoryId: uuid('category_id'),
  productId: uuid('product_id'),
  preferenceLevel: varchar('preference_level', { length: 50 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const customerMetrics = pgTable('crm_customer_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').notNull().unique(),
  churnRiskScore: numeric('churn_risk_score', { precision: 5, scale: 4 }),
  rfmScore: varchar('rfm_score', { length: 10 }),
  npsScore: integer('nps_score'),
  customerSatisfactionScore: numeric('customer_satisfaction_score', { precision: 5, scale: 2 }),
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow(),
})
