import { pgTable, uuid, varchar, text, numeric, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { quotes } from '../002-advanced/advanced'

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    sku: varchar('sku', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    unitPrice: numeric('unit_price', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    pricingType: varchar('pricing_type', { length: 50 }).default('ONE_TIME').notNull(), // ONE_TIME, MONTHLY_SUBSCRIPTION, ANNUAL_SUBSCRIPTION
    taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('0').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantSkuIdx: uniqueIndex('products_tenant_sku_idx').on(table.tenantId, table.sku),
    tenantActiveIdx: index('products_tenant_active_idx').on(table.tenantId, table.isActive),
  }),
)

export const quoteApprovals = pgTable(
  'quote_approvals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
    requestedDiscountPercent: numeric('requested_discount_percent', { precision: 5, scale: 2 }).notNull(),
    requestedByUserId: uuid('requested_by_user_id').notNull(),
    approverUserId: uuid('approver_user_id'),
    status: varchar('status', { length: 50 }).default('PENDING').notNull(), // PENDING, APPROVED, REJECTED
    rejectionReason: text('rejection_reason'),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    quoteIdx: index('quote_approvals_quote_idx').on(table.tenantId, table.quoteId),
    statusIdx: index('quote_approvals_status_idx').on(table.tenantId, table.status),
  }),
)

export const eSignatures = pgTable(
  'e_signatures',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    documentId: uuid('document_id').notNull(),
    documentType: varchar('document_type', { length: 50 }).default('QUOTE').notNull(), // QUOTE, CONTRACT
    signerName: varchar('signer_name', { length: 200 }).notNull(),
    signerEmail: varchar('signer_email', { length: 255 }).notNull(),
    signerPhone: varchar('signer_phone', { length: 50 }),
    token: varchar('token', { length: 255 }).notNull(),
    otpCode: varchar('otp_code', { length: 10 }),
    status: varchar('status', { length: 50 }).default('PENDING').notNull(), // PENDING, OTP_VERIFIED, SIGNED, EXPIRED, DECLINED
    signerIp: varchar('signer_ip', { length: 100 }),
    signerUserAgent: text('signer_user_agent'),
    documentHashSha256: varchar('document_hash_sha256', { length: 64 }),
    signatureDataUrl: text('signature_data_url'),
    signedAt: timestamp('signed_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: uniqueIndex('e_signatures_token_idx').on(table.token),
    docIdx: index('e_signatures_doc_idx').on(table.tenantId, table.documentId),
    statusIdx: index('e_signatures_status_idx').on(table.tenantId, table.status),
  }),
)

export const productTemplates = pgTable(
  'product_templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    category: varchar('category', { length: 100 }).default('GENERAL').notNull(),
    defaultSkuPrefix: varchar('default_sku_prefix', { length: 50 }),
    defaultUnitPrice: numeric('default_unit_price', { precision: 15, scale: 2 }).notNull(),
    defaultCurrency: varchar('default_currency', { length: 10 }).default('USD').notNull(),
    pricingType: varchar('pricing_type', { length: 50 }).default('ONE_TIME').notNull(),
    defaultTaxRate: numeric('default_tax_rate', { precision: 5, scale: 2 }).default('0').notNull(),
    defaultDescription: text('default_description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantCategoryIdx: index('product_templates_tenant_cat_idx').on(table.tenantId, table.category),
  }),
)
