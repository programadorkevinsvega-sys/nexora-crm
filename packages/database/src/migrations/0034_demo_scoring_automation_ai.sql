CREATE TABLE IF NOT EXISTS "lead_scoring_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(200) NOT NULL,
  "description" text,
  "category" varchar(50) NOT NULL,
  "condition" jsonb NOT NULL,
  "points" integer NOT NULL,
  "decay_days" integer,
  "decay_points" integer,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "lead_scoring_rules_tenant_cat_idx" ON "lead_scoring_rules" ("tenant_id", "category");
CREATE INDEX IF NOT EXISTS "lead_scoring_rules_tenant_active_idx" ON "lead_scoring_rules" ("tenant_id", "is_active");

CREATE TABLE IF NOT EXISTS "lead_scores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "contact_id" uuid NOT NULL,
  "score" integer DEFAULT 0 NOT NULL,
  "temperature" varchar(20) DEFAULT 'COLD' NOT NULL,
  "last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
  "history" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "lead_scores_tenant_contact_idx" ON "lead_scores" ("tenant_id", "contact_id");
CREATE INDEX IF NOT EXISTS "lead_scores_tenant_temp_score_idx" ON "lead_scores" ("tenant_id", "temperature", "score");

CREATE TABLE IF NOT EXISTS "workflow_definitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(200) NOT NULL,
  "description" text,
  "version" integer DEFAULT 1 NOT NULL,
  "status" varchar(50) DEFAULT 'DRAFT' NOT NULL,
  "trigger_event" varchar(150) NOT NULL,
  "trigger_filter" jsonb,
  "steps_graph" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "workflow_definitions_tenant_name_ver_idx" ON "workflow_definitions" ("tenant_id", "name", "version");
CREATE INDEX IF NOT EXISTS "workflow_definitions_tenant_status_event_idx" ON "workflow_definitions" ("tenant_id", "status", "trigger_event");

CREATE TABLE IF NOT EXISTS "workflow_executions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "workflow_id" uuid NOT NULL REFERENCES "workflow_definitions" ("id") ON DELETE CASCADE,
  "version" integer NOT NULL,
  "entity_type" varchar(50) NOT NULL,
  "entity_id" uuid NOT NULL,
  "status" varchar(50) DEFAULT 'RUNNING' NOT NULL,
  "current_step_id" varchar(100) NOT NULL,
  "context_data" jsonb,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone,
  "cancelled_at" timestamp with time zone,
  "error_message" text
);

CREATE INDEX IF NOT EXISTS "workflow_executions_tenant_status_idx" ON "workflow_executions" ("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "workflow_executions_entity_idx" ON "workflow_executions" ("tenant_id", "entity_type", "entity_id");

CREATE TABLE IF NOT EXISTS "workflow_step_executions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "execution_id" uuid NOT NULL REFERENCES "workflow_executions" ("id") ON DELETE CASCADE,
  "step_id" varchar(100) NOT NULL,
  "idempotency_key" varchar(255) NOT NULL,
  "status" varchar(50) DEFAULT 'PENDING' NOT NULL,
  "attempts" integer DEFAULT 1 NOT NULL,
  "output_data" jsonb,
  "error_message" text,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "workflow_step_executions_idempotency_idx" ON "workflow_step_executions" ("tenant_id", "idempotency_key");
CREATE INDEX IF NOT EXISTS "workflow_step_executions_execution_idx" ON "workflow_step_executions" ("tenant_id", "execution_id");

CREATE TABLE IF NOT EXISTS "ai_deal_predictions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "deal_id" uuid NOT NULL,
  "win_probability_percent" integer NOT NULL,
  "deal_health" varchar(30) NOT NULL,
  "positive_factors" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "risk_factors" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "recommended_next_actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "ai_deal_predictions_tenant_deal_idx" ON "ai_deal_predictions" ("tenant_id", "deal_id");

CREATE TABLE IF NOT EXISTS "ai_generated_drafts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "contact_id" uuid,
  "deal_id" uuid,
  "channel" varchar(30) NOT NULL,
  "tone" varchar(30) NOT NULL,
  "objective" varchar(50) NOT NULL,
  "subject" text,
  "generated_body" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "ai_drafts_tenant_contact_idx" ON "ai_generated_drafts" ("tenant_id", "contact_id");
CREATE INDEX IF NOT EXISTS "ai_drafts_tenant_deal_idx" ON "ai_generated_drafts" ("tenant_id", "deal_id");
