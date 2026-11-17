CREATE TABLE IF NOT EXISTS "sales_territories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "code" varchar(50) NOT NULL,
  "description" text,
  "parent_territory_id" uuid,
  "country_codes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "regions" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "industries" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "min_employee_count" integer DEFAULT 1,
  "max_employee_count" integer,
  "manager_user_id" uuid,
  "quota_target_usd" numeric(14, 2) DEFAULT 100000.00 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "sales_territories_tenant_idx" ON "sales_territories" ("tenant_id");
CREATE INDEX IF NOT EXISTS "sales_territories_code_idx" ON "sales_territories" ("tenant_id", "code");
CREATE INDEX IF NOT EXISTS "sales_territories_active_idx" ON "sales_territories" ("tenant_id", "is_active");

CREATE TABLE IF NOT EXISTS "territory_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "territory_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" varchar(50) DEFAULT 'ACCOUNT_EXEC' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "territory_members_tenant_idx" ON "territory_members" ("tenant_id");
CREATE INDEX IF NOT EXISTS "territory_members_territory_idx" ON "territory_members" ("tenant_id", "territory_id");
CREATE INDEX IF NOT EXISTS "territory_members_user_idx" ON "territory_members" ("tenant_id", "user_id");
