-- ==============================================================================
-- MIGRATION: 0032_core_enterprise_fields_alignment.sql
-- PURPOSE: Enrich Core CRM tables with Enterprise B2B, CPQ, SLA, and Omnichannel fields
-- ==============================================================================

-- 1. COMPANIES
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(50);
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255);
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "country" VARCHAR(100);
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "city" VARCHAR(100);
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "parent_company_id" UUID;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "linkedin_url" VARCHAR(255);
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "logo_url" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "lifecycle_stage" VARCHAR(50) DEFAULT 'PROSPECT';
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "assigned_user_id" UUID;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "health_score" INT DEFAULT 100;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "tier" VARCHAR(30) DEFAULT 'TIER_2';

CREATE INDEX IF NOT EXISTS "idx_companies_tenant_lifecycle" ON "companies" ("tenant_id", "lifecycle_stage");

-- 2. CONTACTS
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "whatsapp_number" VARCHAR(50);
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "linkedin_url" VARCHAR(255);
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(100) DEFAULT 'America/Bogota';
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "preferred_language" VARCHAR(10) DEFAULT 'ES';
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "lead_score" INT DEFAULT 0;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "assigned_user_id" UUID;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "unsubscribed_at" TIMESTAMPTZ;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "custom_fields" JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS "idx_contacts_tenant_whatsapp" ON "contacts" ("tenant_id", "whatsapp_number");
CREATE INDEX IF NOT EXISTS "idx_contacts_tenant_score" ON "contacts" ("tenant_id", "lead_score");

-- 3. DEALS
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "currency" VARCHAR(10) DEFAULT 'USD';
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "actual_close_date" TIMESTAMPTZ;
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "probability_override" INT;
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "forecast_category" VARCHAR(30) DEFAULT 'PIPELINE';
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "loss_reason" VARCHAR(100);
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "lost_reason_id" UUID;
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "lost_notes" TEXT;
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "territory_id" UUID;
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "price_book_id" UUID;
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "partner_id" UUID;

CREATE INDEX IF NOT EXISTS "idx_deals_tenant_status" ON "deals" ("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_deals_tenant_forecast" ON "deals" ("tenant_id", "forecast_category");

-- 4. SUPPORT TICKETS
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "company_id" UUID;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "channel" VARCHAR(50) DEFAULT 'PORTAL';
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "sla_id" UUID;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "sla_policy_id" UUID;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "first_response_at" TIMESTAMPTZ;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "sla_breach_at" TIMESTAMPTZ;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "resolved_at" TIMESTAMPTZ;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "closed_at" TIMESTAMPTZ;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "is_escalated" TIMESTAMPTZ;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "escalation_level" INT DEFAULT 1;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "csat_score" INT;

CREATE INDEX IF NOT EXISTS "idx_tickets_tenant_company" ON "support_tickets" ("tenant_id", "company_id");

-- 5. INTERACTIONS (NOTES, TASKS, CALLS)
ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "is_pinned" BOOLEAN DEFAULT false;
ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "is_private" BOOLEAN DEFAULT false;
ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "sentiment" VARCHAR(20);

ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "priority" VARCHAR(20) DEFAULT 'MEDIUM';
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "task_type" VARCHAR(50) DEFAULT 'TODO';
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMPTZ;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "reminder_at" TIMESTAMPTZ;

ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "phone_number" VARCHAR(50);
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "call_sid" VARCHAR(255);
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "recording_url" TEXT;
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "company_id" UUID;
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "deal_id" UUID;
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "ai_summary" TEXT;
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "sentiment" VARCHAR(30);

-- 6. PIPELINE STAGES
ALTER TABLE "pipeline_stages" ADD COLUMN IF NOT EXISTS "is_won_stage" BOOLEAN DEFAULT false;
ALTER TABLE "pipeline_stages" ADD COLUMN IF NOT EXISTS "is_lost_stage" BOOLEAN DEFAULT false;
ALTER TABLE "pipeline_stages" ADD COLUMN IF NOT EXISTS "auto_actions" JSONB DEFAULT '[]'::jsonb;
