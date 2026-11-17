import { pgTable, uuid, varchar, text, integer, boolean, jsonb, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'

export const leadScoringRules = pgTable(
  'lead_scoring_rules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 50 }).notNull(), // DEMOGRAPHIC, BEHAVIORAL, ENGAGEMENT
    condition: jsonb('condition').notNull(), // field, operator, value
    points: integer('points').notNull(), // e.g. +25, +15, -10
    decayDays: integer('decay_days'), // e.g. 7 days
    decayPoints: integer('decay_points'), // e.g. -5 points
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantCategoryIdx: index('lead_scoring_rules_tenant_cat_idx').on(table.tenantId, table.category),
    tenantActiveIdx: index('lead_scoring_rules_tenant_active_idx').on(table.tenantId, table.isActive),
  }),
)

export const leadScores = pgTable(
  'lead_scores',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    contactId: uuid('contact_id').notNull(),
    score: integer('score').default(0).notNull(),
    temperature: varchar('temperature', { length: 20 }).default('COLD').notNull(), // COLD, WARM, HOT
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow().notNull(),
    history: jsonb('history').default([]).notNull(), // Array of point adjustments
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantContactIdx: uniqueIndex('lead_scores_tenant_contact_idx').on(table.tenantId, table.contactId),
    tenantTempScoreIdx: index('lead_scores_tenant_temp_score_idx').on(table.tenantId, table.temperature, table.score),
  }),
)
