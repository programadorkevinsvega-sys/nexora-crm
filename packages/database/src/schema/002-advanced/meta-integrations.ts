import { pgTable, uuid, varchar, text, boolean, jsonb, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { contacts } from '../001-core/contacts'

export const metaIntegrations = pgTable(
  'meta_integrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    status: varchar('status', { length: 50 }).default('DISCONNECTED').notNull(),
    metaAppId: varchar('meta_app_id', { length: 255 }),
    metaUserId: varchar('meta_user_id', { length: 255 }),
    metaUserName: varchar('meta_user_name', { length: 255 }),
    accessToken: text('access_token'),
    tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
    selectedPageId: varchar('selected_page_id', { length: 255 }),
    selectedPageName: varchar('selected_page_name', { length: 255 }),
    pageAccessToken: text('page_access_token'),
    adAccountId: varchar('ad_account_id', { length: 255 }),
    adAccountName: varchar('ad_account_name', { length: 255 }),
    webhookSecret: varchar('webhook_secret', { length: 255 }),
    leadGenForms: jsonb('lead_gen_forms').default([]).notNull(),
    autoCreateDeal: boolean('auto_create_deal').default(true).notNull(),
    targetPipelineId: uuid('target_pipeline_id'),
    targetStageId: uuid('target_stage_id'),
    lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: uniqueIndex('meta_integrations_tenant_idx').on(table.tenantId),
  }),
)

export const metaLeadAdLogs = pgTable(
  'meta_lead_ad_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    metaIntegrationId: uuid('meta_integration_id').references(() => metaIntegrations.id, { onDelete: 'cascade' }),
    leadgenId: varchar('leadgen_id', { length: 255 }).notNull(),
    formId: varchar('form_id', { length: 255 }),
    formName: varchar('form_name', { length: 255 }),
    adId: varchar('ad_id', { length: 255 }),
    adName: varchar('ad_name', { length: 255 }),
    campaignName: varchar('campaign_name', { length: 255 }),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    dealId: uuid('deal_id'),
    leadData: jsonb('lead_data').default({}).notNull(),
    status: varchar('status', { length: 50 }).default('PROCESSED').notNull(),
    errorMessage: text('error_message'),
    receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantReceivedIdx: index('meta_lead_logs_tenant_received_idx').on(table.tenantId, table.receivedAt),
    leadgenIdIdx: index('meta_lead_logs_leadgen_idx').on(table.leadgenId),
  }),
)
