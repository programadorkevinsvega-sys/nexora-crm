import { pgTable, uuid, varchar, numeric, timestamp, text, boolean, integer, date } from 'drizzle-orm/pg-core'

export const affiliatePrograms = pgTable('crm_affiliate_programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  commissionType: varchar('commission_type', { length: 50 }).notNull(),
  commissionValue: numeric('commission_value', { precision: 10, scale: 2 }).notNull(),
  cookieDurationDays: integer('cookie_duration_days').default(30),
  isMultiLevel: boolean('is_multi_level').default(false),
  maxMlmLevels: integer('max_mlm_levels').default(1),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const affiliates = pgTable('crm_affiliates', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  programId: uuid('program_id').notNull().references(() => affiliatePrograms.id, { onDelete: 'restrict' }),
  customerId: uuid('customer_id').notNull(),
  referralCode: varchar('referral_code', { length: 50 }).notNull().unique(),
  referralLink: text('referral_link').notNull().unique(),
  parentAffiliateId: uuid('parent_affiliate_id'),
  mlmLevel: integer('mlm_level').default(0),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
  totalEarnings: numeric('total_earnings', { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const affiliateCommissions = pgTable('crm_affiliate_commissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  affiliateId: uuid('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'cascade' }),
  sourceOrderId: uuid('source_order_id').notNull(),
  commissionAmount: numeric('commission_amount', { precision: 15, scale: 2 }).notNull(),
  mlmLevelEarned: integer('mlm_level_earned').default(0),
  status: varchar('status', { length: 50 }).default('PENDING'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const affiliatePayouts = pgTable('crm_affiliate_payouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  affiliateId: uuid('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }),
  paymentReference: varchar('payment_reference', { length: 255 }),
  status: varchar('status', { length: 50 }).default('PROCESSING'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const crmPartners = pgTable('crm_partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  companyId: uuid('company_id').notNull(),
  partnerType: varchar('partner_type', { length: 50 }).notNull(),
  partnerTier: varchar('partner_tier', { length: 50 }).default('SILVER'),
  dedicatedAccountManagerId: uuid('dedicated_account_manager_id'),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const partnerDealRegistrations = pgTable('crm_partner_deal_registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  partnerId: uuid('partner_id').notNull().references(() => crmPartners.id, { onDelete: 'cascade' }),
  endCustomerName: varchar('end_customer_name', { length: 255 }).notNull(),
  endCustomerWebsite: varchar('end_customer_website', { length: 255 }),
  estimatedDealValue: numeric('estimated_deal_value', { precision: 15, scale: 2 }),
  status: varchar('status', { length: 50 }).default('PENDING'),
  expirationDate: date('expiration_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
