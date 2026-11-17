import { pgTable, uuid, varchar, numeric, timestamp, text, date, integer, index } from 'drizzle-orm/pg-core'
import { pipelines, pipelineStages } from './pipelines'
import { contacts } from './contacts'
import { companies } from './companies'

export const deals = pgTable(
  'deals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    pipelineId: uuid('pipeline_id').notNull().references(() => pipelines.id, { onDelete: 'cascade' }),
    stageId: uuid('stage_id').notNull().references(() => pipelineStages.id, { onDelete: 'restrict' }),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
    name: varchar('name', { length: 255 }).notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).default('0'),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    expectedCloseDate: date('expected_close_date'),
    actualCloseDate: timestamp('actual_close_date', { withTimezone: true }),
    status: varchar('status', { length: 20 }).default('OPEN'), // 'OPEN' | 'WON' | 'LOST'
    probabilityOverride: integer('probability_override'),
    forecastCategory: varchar('forecast_category', { length: 30 }).default('PIPELINE'), // 'PIPELINE' | 'BEST_CASE' | 'COMMIT' | 'CLOSED'
    assignedUserId: uuid('assigned_user_id'),
    lossReason: varchar('loss_reason', { length: 100 }), // 'PRICE' | 'COMPETITOR' | 'TIMING' | 'FEATURE_GAP' | 'OTHER'
    lostReasonId: uuid('lost_reason_id'),
    lostNotes: text('lost_notes'),
    territoryId: uuid('territory_id'),
    priceBookId: uuid('price_book_id'),
    partnerId: uuid('partner_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantCreatedIdx: index('idx_deals_tenant_created').on(table.tenantId, table.createdAt),
    pipelineStageIdx: index('idx_deals_pipeline_stage').on(table.pipelineId, table.stageId),
    stageIdx: index('idx_deals_stage').on(table.stageId),
    assignedUserIdx: index('idx_deals_assigned_user').on(table.assignedUserId),
    tenantStatusIdx: index('idx_deals_tenant_status').on(table.tenantId, table.status),
    tenantForecastIdx: index('idx_deals_tenant_forecast').on(table.tenantId, table.forecastCategory),
  }),
)
