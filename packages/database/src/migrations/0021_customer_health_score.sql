CREATE TABLE IF NOT EXISTS "customer_health_scores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "contact_id" uuid,
  "company_id" uuid,
  "health_score" integer NOT NULL,
  "status" varchar(20) DEFAULT 'HEALTHY' NOT NULL,
  "engagement_score" integer DEFAULT 25 NOT NULL,
  "support_score" integer DEFAULT 20 NOT NULL,
  "financial_score" integer DEFAULT 20 NOT NULL,
  "recency_score" integer DEFAULT 15 NOT NULL,
  "churn_probability" numeric(5, 2) DEFAULT '10.00' NOT NULL,
  "primary_risk_factor" text,
  "recommended_action" text,
  "last_calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "health_scores_tenant_idx" ON "customer_health_scores" ("tenant_id");
CREATE INDEX IF NOT EXISTS "health_scores_contact_idx" ON "customer_health_scores" ("tenant_id", "contact_id");
CREATE INDEX IF NOT EXISTS "health_scores_company_idx" ON "customer_health_scores" ("tenant_id", "company_id");
CREATE INDEX IF NOT EXISTS "health_scores_status_idx" ON "customer_health_scores" ("tenant_id", "status");
