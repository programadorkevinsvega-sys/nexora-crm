import { pgTable, uuid, varchar, text, timestamp, numeric, jsonb, index } from 'drizzle-orm/pg-core'

export const paymentTransactions = pgTable(
  'payment_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    resourceType: varchar('resource_type', { length: 30 }).notNull(), // 'QUOTE' | 'CONTRACT' | 'DEAL'
    resourceId: uuid('resource_id').notNull(),
    gateway: varchar('gateway', { length: 30 }).default('STRIPE').notNull(), // 'STRIPE' | 'WOMPI' | 'MERCADOPAGO' | 'BANK_TRANSFER'
    externalPaymentId: varchar('external_payment_id', { length: 255 }),
    paymentUrl: text('payment_url').notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    status: varchar('status', { length: 30 }).default('PENDING').notNull(), // 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
    customerEmail: varchar('customer_email', { length: 255 }),
    customerName: varchar('customer_name', { length: 255 }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('payment_tx_tenant_idx').on(table.tenantId),
    resourceIdx: index('payment_tx_resource_idx').on(table.tenantId, table.resourceType, table.resourceId),
    statusIdx: index('payment_tx_status_idx').on(table.tenantId, table.status),
    externalIdIdx: index('payment_tx_external_id_idx').on(table.externalPaymentId),
  }),
)
