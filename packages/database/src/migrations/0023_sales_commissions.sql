CREATE TABLE IF NOT EXISTS "commission_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "calculation_model" varchar(50) DEFAULT 'FLAT_PERCENTAGE' NOT NULL,
  "base_rate" numeric(5, 2) DEFAULT 5.00 NOT NULL,
  "tier_rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "accelerator_rate" numeric(5, 2) DEFAULT 8.00,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "commission_plans_tenant_idx" ON "commission_plans" ("tenant_id");
CREATE INDEX IF NOT EXISTS "commission_plans_active_idx" ON "commission_plans" ("tenant_id", "is_active");

CREATE TABLE IF NOT EXISTS "commission_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "plan_id" uuid,
  "deal_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "deal_value" numeric(14, 2) NOT NULL,
  "commission_rate" numeric(5, 2) NOT NULL,
  "commission_amount" numeric(14, 2) NOT NULL,
  "split_percentage" numeric(5, 2) DEFAULT 100.00 NOT NULL,
  "status" varchar(30) DEFAULT 'PENDING' NOT NULL,
  "period" varchar(7) NOT NULL,
  "approved_by_user_id" uuid,
  "approved_at" timestamp with time zone,
  "paid_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "commission_records_tenant_idx" ON "commission_records" ("tenant_id");
CREATE INDEX IF NOT EXISTS "commission_records_user_idx" ON "commission_records" ("tenant_id", "user_id");
CREATE INDEX IF NOT EXISTS "commission_records_deal_idx" ON "commission_records" ("tenant_id", "deal_id");
CREATE INDEX IF NOT EXISTS "commission_records_status_idx" ON "commission_records" ("tenant_id", "status");
