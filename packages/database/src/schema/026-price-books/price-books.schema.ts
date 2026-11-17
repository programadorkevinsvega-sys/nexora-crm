import { pgTable, uuid, varchar, text, timestamp, boolean, numeric, integer, index } from 'drizzle-orm/pg-core'

export const priceBooks = pgTable(
  'price_books',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(), // 'USD' | 'COP' | 'MXN' | 'EUR'
    description: text('description'),
    isStandard: boolean('is_standard').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('price_books_tenant_idx').on(table.tenantId),
    codeIdx: index('price_books_code_idx').on(table.tenantId, table.code),
    currencyIdx: index('price_books_currency_idx').on(table.tenantId, table.currency),
  }),
)

export const priceBookEntries = pgTable(
  'price_book_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    priceBookId: uuid('price_book_id').notNull(),
    productId: uuid('product_id').notNull(),
    unitPrice: numeric('unit_price', { precision: 14, scale: 2 }).notNull(),
    minQuantity: integer('min_quantity').default(1).notNull(),
    discountPercentage: numeric('discount_percentage', { precision: 5, scale: 2 }).default('0.00').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('price_book_entries_tenant_idx').on(table.tenantId),
    bookIdx: index('price_book_entries_book_idx').on(table.tenantId, table.priceBookId),
    productIdx: index('price_book_entries_product_idx').on(table.tenantId, table.productId),
  }),
)

export const productInventoryLevels = pgTable(
  'product_inventory_levels',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    productId: uuid('product_id').notNull(),
    stockOnHand: integer('stock_on_hand').default(0).notNull(),
    stockReserved: integer('stock_reserved').default(0).notNull(),
    stockAvailable: integer('stock_available').default(0).notNull(),
    reorderPoint: integer('reorder_point').default(10).notNull(),
    warehouseLocation: varchar('warehouse_location', { length: 100 }).default('Principal'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('product_inventory_tenant_idx').on(table.tenantId),
    productIdx: index('product_inventory_product_idx').on(table.tenantId, table.productId),
  }),
)
