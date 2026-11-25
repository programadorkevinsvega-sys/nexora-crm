import { pgTable, uuid, varchar, text, timestamp, numeric, jsonb, index } from 'drizzle-orm/pg-core'

export const partnerTiers = pgTable(
  'partner_tiers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 50 }).notNull(), // 'SILVER' | 'GOLD' | 'PLATINUM'
    minAnnualRevenueUsd: numeric('min_annual_revenue_usd', { precision: 14, scale: 2 }).default('50000.00').notNull(),
    discountMarginPct: numeric('discount_margin_pct', { precision: 5, scale: 2 }).default('20.00').notNull(),
    mdfAllowanceUsd: numeric('mdf_allowance_usd', { precision: 14, scale: 2 }).default('5000.00').notNull(),
    benefits: jsonb('benefits').default([]).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('partner_tiers_tenant_idx').on(table.tenantId),
    codeIdx: index('partner_tiers_code_idx').on(table.tenantId, table.code),
  }),
)

export const partners = pgTable(
  'prm_partners',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    companyId: uuid('company_id'),
    tierId: uuid('tier_id').notNull(),
    partnerName: varchar('partner_name', { length: 255 }).notNull(),
    contactEmail: varchar('contact_email', { length: 255 }).notNull(),
    contactPhone: varchar('contact_phone', { length: 50 }),
    status: varchar('status', { length: 50 }).default('ACTIVE').notNull(), // 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED'
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('partners_tenant_idx').on(table.tenantId),
    tierIdx: index('partners_tier_idx').on(table.tenantId, table.tierId),
    statusIdx: index('partners_status_idx').on(table.tenantId, table.status),
  }),
)

export const partnerDealRegistrations = pgTable(
  'partner_deal_registrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    partnerId: uuid('partner_id').notNull(),
    prospectCompanyName: varchar('prospect_company_name', { length: 255 }).notNull(),
    contactEmail: varchar('contact_email', { length: 255 }).notNull(),
    estimatedValueUsd: numeric('estimated_value_usd', { precision: 14, scale: 2 }).notNull(),
    productCategory: varchar('product_category', { length: 100 }).default('SAAS_ENTERPRISE').notNull(),
    status: varchar('status', { length: 50 }).default('SUBMITTED').notNull(), // 'SUBMITTED' | 'APPROVED' | 'EXPIRED' | 'REJECTED' | 'CONVERTED'
    protectedUntil: timestamp('protected_until', { withTimezone: true }),
    convertedDealId: uuid('converted_deal_id'),
    reviewedByUserId: uuid('reviewed_by_user_id'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('partner_deals_tenant_idx').on(table.tenantId),
    partnerIdx: index('partner_deals_partner_idx').on(table.tenantId, table.partnerId),
    statusIdx: index('partner_deals_status_idx').on(table.tenantId, table.status),
  }),
)
