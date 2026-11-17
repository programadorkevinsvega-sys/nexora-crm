import { pgSchema, uuid, varchar, text, boolean, integer, bigint, timestamp, jsonb, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core'

export const tenantsSchema = pgSchema('tenants')

export const tenants = tenantsSchema.table('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  legalName: varchar('legal_name', { length: 255 }),
  taxId: varchar('tax_id', { length: 100 }),
  taxRegime: varchar('tax_regime', { length: 100 }),
  legalAddress: text('legal_address'),
  city: varchar('city', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  industryType: varchar('industry_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
  timezone: varchar('timezone', { length: 100 }).default('UTC'),
  currencyCode: varchar('currency_code', { length: 10 }).default('USD'),
  ownerUserId: uuid('owner_user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const branches = tenantsSchema.table('branches', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  isActive: boolean('is_active').default(true),
  isHeadquarters: boolean('is_headquarters').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const tenantBranding = tenantsSchema.table('tenant_branding', {
  tenantId: uuid('tenant_id').primaryKey(),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  primaryColor: varchar('primary_color', { length: 20 }).default('#3B82F6'),
  secondaryColor: varchar('secondary_color', { length: 20 }).default('#1E293B'),
  customDomain: varchar('custom_domain', { length: 255 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const tenantSaaSSnapshot = tenantsSchema.table('tenant_saas_snapshot', {
  tenantId: uuid('tenant_id').primaryKey(),
  platformSubscriptionId: uuid('platform_subscription_id'),
  platformPlanId: uuid('platform_plan_id'),
  planSlug: varchar('plan_slug', { length: 120 }),
  planDisplayName: varchar('plan_display_name', { length: 255 }),
  subscriptionStatus: varchar('subscription_status', { length: 32 }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  platformInvoiceId: uuid('platform_invoice_id'),
  invoiceNumber: varchar('invoice_number', { length: 128 }),
  invoiceStatus: varchar('invoice_status', { length: 24 }),
  invoiceTotalMinor: bigint('invoice_total_minor', { mode: 'number' }),
  invoiceCurrency: varchar('invoice_currency', { length: 3 }),
  invoicePaymentState: varchar('invoice_payment_state', { length: 24 }).notNull().default('UNKNOWN'),
  paidInFull: boolean('paid_in_full').notNull().default(false),
  lastPaymentAt: timestamp('last_payment_at', { withTimezone: true }),
  externalSubscriptionRef: varchar('external_subscription_ref', { length: 255 }),
  externalInvoiceRef: varchar('external_invoice_ref', { length: 255 }),
  syncedAt: timestamp('synced_at', { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const tenantFeatures = tenantsSchema.table('tenant_features', {
  tenantId: uuid('tenant_id').notNull(),
  featureCode: varchar('feature_code', { length: 100 }).notNull(),
  isEnabled: boolean('is_enabled').default(true),
  enabledAt: timestamp('enabled_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.tenantId, table.featureCode] }),
}))

export const tenantUsageMetrics = tenantsSchema.table('tenant_usage_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  metricName: varchar('metric_name', { length: 100 }).notNull(),
  currentValue: bigint('current_value', { mode: 'number' }).notNull().default(0),
  limitValue: bigint('limit_value', { mode: 'number' }),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueMetricPeriod: uniqueIndex('idx_usage_metric_period').on(table.tenantId, table.metricName, table.periodStart),
}))

export const tenantDomains = tenantsSchema.table('tenant_domains', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  domain: varchar('domain', { length: 255 }).notNull(),
  sslStatus: varchar('ssl_status', { length: 50 }).default('PENDING'),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
