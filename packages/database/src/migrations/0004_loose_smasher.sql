CREATE SCHEMA "audit";
--> statement-breakpoint
CREATE SCHEMA "scheduler";
--> statement-breakpoint
CREATE SCHEMA "storage";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit"."event_dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_event_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"source_service" varchar(150),
	"event_type" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"field_name" varchar(100),
	"old_value" text,
	"new_value" text,
	"changed_by_user_id" uuid,
	"module_name" varchar(100),
	"correlation_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"entity_type" varchar(100),
	"entity_id" uuid,
	"remind_at" timestamp with time zone NOT NULL,
	"reminded" boolean DEFAULT false NOT NULL,
	"notified" boolean DEFAULT false NOT NULL,
	"repeat_interval" varchar(50),
	"repeat_count" integer,
	"repeat_remaining" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."scheduled_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"cron_expression" varchar(100) NOT NULL,
	"task_type" varchar(100) NOT NULL,
	"target_service" varchar(150),
	"target_endpoint" varchar(500),
	"target_payload" jsonb,
	"enabled" boolean DEFAULT true NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"timeout_seconds" integer DEFAULT 300,
	"created_by_user_id" uuid,
	"last_run_at" timestamp with time zone,
	"next_run_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."event_dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_event_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"source_service" varchar(150),
	"event_type" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."sla_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"condition_field" varchar(100),
	"condition_operator" varchar(50),
	"condition_value" varchar(500),
	"response_time_minutes" integer NOT NULL,
	"resolution_time_minutes" integer,
	"escalation_user_id" uuid,
	"escalation_email" varchar(255),
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."sla_violations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sla_config_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"violation_type" varchar(50) NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"escalated_at" timestamp with time zone,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."task_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"tenant_id" uuid,
	"status" varchar(50) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"result_payload" jsonb,
	"error_message" text,
	"attempt_number" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage"."files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"original_name" varchar(500) NOT NULL,
	"mime_type" varchar(127) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"storage_key" varchar(1000) NOT NULL,
	"bucket" varchar(255) NOT NULL,
	"uploaded_by_user_id" uuid,
	"entity_type" varchar(100),
	"entity_id" uuid,
	"metadata_json" jsonb,
	"checksum_sha256" varchar(64),
	"is_public" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage"."event_dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_event_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"source_service" varchar(150),
	"event_type" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_tenant_created" ON "audit"."audit_logs" ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity" ON "audit"."audit_logs" ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_module" ON "audit"."audit_logs" ("tenant_id","module_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_outbox_published_created" ON "audit"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_outbox_event_type" ON "audit"."outbox_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_reminders_due" ON "scheduler"."reminders" ("tenant_id","remind_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_tasks_next_run" ON "scheduler"."scheduled_tasks" ("enabled","next_run_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_tasks_type" ON "scheduler"."scheduled_tasks" ("task_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_outbox_published_created" ON "scheduler"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_outbox_event_type" ON "scheduler"."outbox_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_sla_violations_entity" ON "scheduler"."sla_violations" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_sla_violations_config" ON "scheduler"."sla_violations" ("sla_config_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_exec_task_started" ON "scheduler"."task_executions" ("task_id","started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_files_entity" ON "storage"."files" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_files_key" ON "storage"."files" ("storage_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_outbox_published_created" ON "storage"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_outbox_event_type" ON "storage"."outbox_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deals_tenant_created" ON "deals" ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deals_pipeline_stage" ON "deals" ("pipeline_id","stage_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deals_stage" ON "deals" ("stage_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deals_assigned_user" ON "deals" ("assigned_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_outbox_published_created" ON "outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_outbox_aggregate" ON "outbox_events" ("aggregate_type","aggregate_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_outbox_published_created" ON "auth"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_outbox_event_type" ON "auth"."outbox_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iam_outbox_published_created" ON "iam"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iam_outbox_event_type" ON "iam"."outbox_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notif_outbox_published_created" ON "notifications"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notif_outbox_event_type" ON "notifications"."outbox_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notif_queue_status_scheduled" ON "notifications"."notification_queue" ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notif_queue_channel_status" ON "notifications"."notification_queue" ("channel_type","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tenant_outbox_published_created" ON "tenants"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tenant_outbox_event_type" ON "tenants"."outbox_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_outbox_published_created" ON "users"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_outbox_event_type" ON "users"."outbox_events" ("event_type");