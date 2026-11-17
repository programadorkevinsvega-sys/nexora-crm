CREATE TABLE IF NOT EXISTS "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "sku" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "unit_price" numeric(15,2) NOT NULL,
  "currency" varchar(10) DEFAULT 'USD' NOT NULL,
  "pricing_type" varchar(50) DEFAULT 'ONE_TIME' NOT NULL,
  "tax_rate" numeric(5,2) DEFAULT '0' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "products_tenant_sku_idx" ON "products" ("tenant_id", "sku");
CREATE INDEX IF NOT EXISTS "products_tenant_active_idx" ON "products" ("tenant_id", "is_active");

CREATE TABLE IF NOT EXISTS "product_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "category" varchar(100) DEFAULT 'GENERAL' NOT NULL,
  "default_sku_prefix" varchar(50),
  "default_unit_price" numeric(15,2) NOT NULL,
  "default_currency" varchar(10) DEFAULT 'USD' NOT NULL,
  "pricing_type" varchar(50) DEFAULT 'ONE_TIME' NOT NULL,
  "default_tax_rate" numeric(5,2) DEFAULT '0' NOT NULL,
  "default_description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "product_templates_tenant_cat_idx" ON "product_templates" ("tenant_id", "category");

CREATE TABLE IF NOT EXISTS "quote_approvals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "quote_id" uuid NOT NULL REFERENCES "quotes" ("id") ON DELETE CASCADE,
  "requested_discount_percent" numeric(5,2) NOT NULL,
  "requested_by_user_id" uuid NOT NULL,
  "approver_user_id" uuid,
  "status" varchar(50) DEFAULT 'PENDING' NOT NULL,
  "rejection_reason" text,
  "decided_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "quote_approvals_quote_idx" ON "quote_approvals" ("tenant_id", "quote_id");
CREATE INDEX IF NOT EXISTS "quote_approvals_status_idx" ON "quote_approvals" ("tenant_id", "status");

CREATE TABLE IF NOT EXISTS "knowledge_base_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(100) NOT NULL,
  "slug" varchar(120) NOT NULL,
  "description" text,
  "icon" varchar(50) DEFAULT 'book-open',
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_public" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "kb_categories_tenant_slug_idx" ON "knowledge_base_categories" ("tenant_id", "slug");
CREATE INDEX IF NOT EXISTS "kb_categories_tenant_order_idx" ON "knowledge_base_categories" ("tenant_id", "sort_order");

CREATE TABLE IF NOT EXISTS "knowledge_base_articles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "category_id" uuid REFERENCES "knowledge_base_categories" ("id") ON DELETE SET NULL,
  "title" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL,
  "summary" text,
  "content_markdown" text NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "view_count" integer DEFAULT 0 NOT NULL,
  "helpful_votes" integer DEFAULT 0 NOT NULL,
  "unhelpful_votes" integer DEFAULT 0 NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "author_name" varchar(150) DEFAULT 'Equipo de Soporte',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "kb_articles_tenant_slug_idx" ON "knowledge_base_articles" ("tenant_id", "slug");
CREATE INDEX IF NOT EXISTS "kb_articles_tenant_category_idx" ON "knowledge_base_articles" ("tenant_id", "category_id");
CREATE INDEX IF NOT EXISTS "kb_articles_tenant_published_idx" ON "knowledge_base_articles" ("tenant_id", "is_published");
