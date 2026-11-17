CREATE TABLE IF NOT EXISTS "sla_policies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "priority" varchar(50) DEFAULT 'HIGH' NOT NULL,
  "first_response_time_minutes" integer DEFAULT 60 NOT NULL,
  "resolution_time_minutes" integer DEFAULT 240 NOT NULL,
  "business_hours_only" boolean DEFAULT true NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "sla_policies_tenant_idx" ON "sla_policies" ("tenant_id");
CREATE INDEX IF NOT EXISTS "sla_policies_priority_idx" ON "sla_policies" ("tenant_id", "priority");

CREATE TABLE IF NOT EXISTS "sla_escalation_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "policy_id" uuid NOT NULL,
  "level" integer DEFAULT 1 NOT NULL,
  "trigger_after_minutes" integer NOT NULL,
  "action_type" varchar(50) DEFAULT 'NOTIFY_MANAGER' NOT NULL,
  "target_user_id" uuid,
  "target_team_id" uuid,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "sla_rules_tenant_idx" ON "sla_escalation_rules" ("tenant_id");
CREATE INDEX IF NOT EXISTS "sla_rules_policy_idx" ON "sla_escalation_rules" ("tenant_id", "policy_id");

CREATE TABLE IF NOT EXISTS "ticket_sla_trackers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "ticket_id" uuid NOT NULL,
  "policy_id" uuid NOT NULL,
  "first_response_due_at" timestamp with time zone NOT NULL,
  "first_responded_at" timestamp with time zone,
  "resolution_due_at" timestamp with time zone NOT NULL,
  "resolved_at" timestamp with time zone,
  "is_first_response_breached" boolean DEFAULT false NOT NULL,
  "is_resolution_breached" boolean DEFAULT false NOT NULL,
  "escalation_level_reached" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "sla_trackers_tenant_idx" ON "ticket_sla_trackers" ("tenant_id");
CREATE INDEX IF NOT EXISTS "sla_trackers_ticket_idx" ON "ticket_sla_trackers" ("tenant_id", "ticket_id");
