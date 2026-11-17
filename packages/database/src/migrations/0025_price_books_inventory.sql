CREATE TABLE IF NOT EXISTS "price_books" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "code" varchar(50) NOT NULL,
  "currency" varchar(10) DEFAULT 'USD' NOT NULL,
  "description" text,
  "is_standard" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "valid_from" timestamp with time zone,
  "valid_until" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "price_books_tenant_idx" ON "price_books" ("tenant_id");
CREATE INDEX IF NOT EXISTS "price_books_code_idx" ON "price_books" ("tenant_id", "code");
CREATE INDEX IF NOT EXISTS "price_books_currency_idx" ON "price_books" ("tenant_id", "currency");

CREATE TABLE IF NOT EXISTS "price_book_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "price_book_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "unit_price" numeric(14, 2) NOT NULL,
  "min_quantity" integer DEFAULT 1 NOT NULL,
  "discount_percentage" numeric(5, 2) DEFAULT 0.00 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "price_book_entries_tenant_idx" ON "price_book_entries" ("tenant_id");
CREATE INDEX IF NOT EXISTS "price_book_entries_book_idx" ON "price_book_entries" ("tenant_id", "price_book_id");
CREATE INDEX IF NOT EXISTS "price_book_entries_product_idx" ON "price_book_entries" ("tenant_id", "product_id");

CREATE TABLE IF NOT EXISTS "product_inventory_levels" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "stock_on_hand" integer DEFAULT 0 NOT NULL,
  "stock_reserved" integer DEFAULT 0 NOT NULL,
  "stock_available" integer DEFAULT 0 NOT NULL,
  "reorder_point" integer DEFAULT 10 NOT NULL,
  "warehouse_location" varchar(100) DEFAULT 'Principal',
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "product_inventory_tenant_idx" ON "product_inventory_levels" ("tenant_id");
CREATE INDEX IF NOT EXISTS "product_inventory_product_idx" ON "product_inventory_levels" ("tenant_id", "product_id");
