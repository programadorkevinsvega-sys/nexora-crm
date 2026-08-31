import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core'

export const aiDealPredictions = pgTable(
  'ai_deal_predictions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    dealId: uuid('deal_id').notNull(),
    winProbabilityPercent: integer('win_probability_percent').notNull(),
    dealHealth: varchar('deal_health', { length: 30 }).notNull(), // EXCELLENT, GOOD, WARNING, CRITICAL
    positiveFactors: jsonb('positive_factors').default([]).notNull(),
    riskFactors: jsonb('risk_factors').default([]).notNull(),
    recommendedNextActions: jsonb('recommended_next_actions').default([]).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantDealIdx: uniqueIndex('ai_deal_predictions_tenant_deal_idx').on(table.tenantId, table.dealId),
  }),
)

export const aiGeneratedDrafts = pgTable(
  'ai_generated_drafts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    contactId: uuid('contact_id'),
    dealId: uuid('deal_id'),
    channel: varchar('channel', { length: 30 }).notNull(), // EMAIL, WHATSAPP, NOTE
    tone: varchar('tone', { length: 30 }).notNull(), // FORMAL, FRIENDLY, PERSUASIVE, URGENT
    objective: varchar('objective', { length: 50 }).notNull(),
    subject: text('subject'),
    generatedBody: text('generated_body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantContactIdx: index('ai_drafts_tenant_contact_idx').on(table.tenantId, table.contactId),
    tenantDealIdx: index('ai_drafts_tenant_deal_idx').on(table.tenantId, table.dealId),
  }),
)
