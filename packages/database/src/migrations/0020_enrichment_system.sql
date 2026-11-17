CREATE TABLE IF NOT EXISTS "enrichment_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "target_type" varchar(20) NOT NULL,
  "target_id" uuid,
  "source" varchar(50) DEFAULT 'LINKEDIN' NOT NULL,
  "status" varchar(30) DEFAULT 'SUCCESS' NOT NULL,
  "email_deliverability_score" integer,
  "is_disposable_email" boolean DEFAULT false,
  "is_mx_valid" boolean DEFAULT true,
  "linkedin_profile_url" text,
  "job_headline" varchar(255),
  "seniority_level" varchar(50),
  "company_headcount" varchar(50),
  "industry" varchar(100),
  "technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "raw_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "enrichment_logs_tenant_idx" ON "enrichment_logs" ("tenant_id");
CREATE INDEX IF NOT EXISTS "enrichment_logs_target_idx" ON "enrichment_logs" ("tenant_id", "target_type", "target_id");
