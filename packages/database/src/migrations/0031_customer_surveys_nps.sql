CREATE TABLE IF NOT EXISTS "customer_surveys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "type" varchar(50) DEFAULT 'NPS' NOT NULL,
  "trigger_event" varchar(50) DEFAULT 'TICKET_RESOLVED' NOT NULL,
  "question_text" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "surveys_tenant_idx" ON "customer_surveys" ("tenant_id");
CREATE INDEX IF NOT EXISTS "surveys_type_idx" ON "customer_surveys" ("tenant_id", "type");

CREATE TABLE IF NOT EXISTS "survey_responses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "survey_id" uuid NOT NULL,
  "contact_id" uuid,
  "score" integer NOT NULL,
  "category" varchar(50) NOT NULL,
  "feedback_text" text,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "survey_resp_tenant_idx" ON "survey_responses" ("tenant_id");
CREATE INDEX IF NOT EXISTS "survey_resp_survey_idx" ON "survey_responses" ("tenant_id", "survey_id");
