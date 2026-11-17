CREATE TABLE IF NOT EXISTS "bi_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "category" varchar(50) DEFAULT 'EXECUTIVE' NOT NULL,
  "embed_type" varchar(30) DEFAULT 'POWER_BI_WEB' NOT NULL,
  "embed_url" text NOT NULL,
  "report_id" varchar(255),
  "workspace_id" varchar(255),
  "refresh_schedule" varchar(50) DEFAULT 'HOURLY' NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "bi_reports_tenant_idx" ON "bi_reports" ("tenant_id");
CREATE INDEX IF NOT EXISTS "bi_reports_category_idx" ON "bi_reports" ("tenant_id", "category");
