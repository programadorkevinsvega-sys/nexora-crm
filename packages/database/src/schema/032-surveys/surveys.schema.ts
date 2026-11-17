import { pgTable, uuid, varchar, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core'

export const customerSurveys = pgTable(
  'customer_surveys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).default('NPS').notNull(), // 'NPS' | 'CSAT' | 'CES'
    triggerEvent: varchar('trigger_event', { length: 50 }).default('TICKET_RESOLVED').notNull(), // 'DEAL_WON' | 'TICKET_RESOLVED' | 'MANUAL'
    questionText: text('question_text').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('surveys_tenant_idx').on(table.tenantId),
    typeIdx: index('surveys_type_idx').on(table.tenantId, table.type),
  }),
)

export const surveyResponses = pgTable(
  'survey_responses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    surveyId: uuid('survey_id').notNull(),
    contactId: uuid('contact_id'),
    score: integer('score').notNull(), // 0 to 10 for NPS, 1 to 5 for CSAT
    category: varchar('category', { length: 50 }).notNull(), // 'PROMOTER' | 'PASSIVE' | 'DETRACTOR' | 'SATISFIED' | 'NEUTRAL' | 'DISSATISFIED'
    feedbackText: text('feedback_text'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('survey_resp_tenant_idx').on(table.tenantId),
    surveyIdx: index('survey_resp_survey_idx').on(table.tenantId, table.surveyId),
  }),
)
