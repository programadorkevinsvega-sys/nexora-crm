CREATE TABLE IF NOT EXISTS "partner_tiers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(100) NOT NULL,
  "code" varchar(50) NOT NULL,
  "min_annual_revenue_usd" numeric(14, 2) DEFAULT 50000.00 NOT NULL,
  "discount_margin_pct" numeric(5, 2) DEFAULT 20.00 NOT NULL,
  "mdf_allowance_usd" numeric(14, 2) DEFAULT 5000.00 NOT NULL,
  "benefits" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "partner_tiers_tenant_idx" ON "partner_tiers" ("tenant_id");
CREATE INDEX IF NOT EXISTS "partner_tiers_code_idx" ON "partner_tiers" ("tenant_id", "code");

CREATE TABLE IF NOT EXISTS "partners" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "company_id" uuid,
  "tier_id" uuid NOT NULL,
  "partner_name" varchar(255) NOT NULL,
  "contact_email" varchar(255) NOT NULL,
  "contact_phone" varchar(50),
  "status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
  "joined_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "partners_tenant_idx" ON "partners" ("tenant_id");
CREATE INDEX IF NOT EXISTS "partners_tier_idx" ON "partners" ("tenant_id", "tier_id");
CREATE INDEX IF NOT EXISTS "partners_status_idx" ON "partners" ("tenant_id", "status");

CREATE TABLE IF NOT EXISTS "partner_deal_registrations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "partner_id" uuid NOT NULL,
  "prospect_company_name" varchar(255) NOT NULL,
  "contact_email" varchar(255) NOT NULL,
  "estimated_value_usd" numeric(14, 2) NOT NULL,
  "product_category" varchar(100) DEFAULT 'SAAS_ENTERPRISE' NOT NULL,
  "status" varchar(50) DEFAULT 'SUBMITTED' NOT NULL,
  "protected_until" timestamp with time zone,
  "converted_deal_id" uuid,
  "reviewed_by_user_id" uuid,
  "reviewed_at" timestamp with time zone,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "partner_deals_tenant_idx" ON "partner_deal_registrations" ("tenant_id");
CREATE INDEX IF NOT EXISTS "partner_deals_partner_idx" ON "partner_deal_registrations" ("tenant_id", "partner_id");
CREATE INDEX IF NOT EXISTS "partner_deals_status_idx" ON "partner_deal_registrations" ("tenant_id", "status");
