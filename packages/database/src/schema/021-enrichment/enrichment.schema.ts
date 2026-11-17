import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core'

export const enrichmentLogs = pgTable(
  'enrichment_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    targetType: varchar('target_type', { length: 20 }).notNull(), // 'CONTACT' | 'COMPANY' | 'EMAIL'
    targetId: uuid('target_id'),
    source: varchar('source', { length: 50 }).default('LINKEDIN').notNull(), // 'LINKEDIN' | 'CLEARBIT' | 'HUNTER'
    status: varchar('status', { length: 30 }).default('SUCCESS').notNull(),
    emailDeliverabilityScore: integer('email_deliverability_score'),
    isDisposableEmail: boolean('is_disposable_email').default(false),
    isMxValid: boolean('is_mx_valid').default(true),
    linkedinProfileUrl: text('linkedin_profile_url'),
    jobHeadline: varchar('job_headline', { length: 255 }),
    seniorityLevel: varchar('seniority_level', { length: 50 }),
    companyHeadcount: varchar('company_headcount', { length: 50 }),
    industry: varchar('industry', { length: 100 }),
    technologies: jsonb('technologies').$type<string[]>().default([]).notNull(),
    rawPayload: jsonb('raw_payload').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('enrichment_logs_tenant_idx').on(table.tenantId),
    targetIdx: index('enrichment_logs_target_idx').on(table.tenantId, table.targetType, table.targetId),
  }),
)
