CREATE SCHEMA "iam";
--> statement-breakpoint
CREATE SCHEMA "notifications";
--> statement-breakpoint
CREATE SCHEMA "tenants";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."event_dead_letters" (
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
CREATE TABLE IF NOT EXISTS "auth"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."outbox_events" (
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
CREATE TABLE IF NOT EXISTS "iam"."event_dead_letters" (
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
CREATE TABLE IF NOT EXISTS "iam"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam"."outbox_events" (
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
CREATE TABLE IF NOT EXISTS "iam"."permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module" varchar(100) NOT NULL,
	"action" varchar(100) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam"."role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam"."roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_system_role" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam"."user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"branch_id" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_branch_id_pk" PRIMARY KEY("user_id","role_id","branch_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."event_dead_letters" (
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
CREATE TABLE IF NOT EXISTS "notifications"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."outbox_events" (
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
CREATE TABLE IF NOT EXISTS "notifications"."notification_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"channel_type" varchar(50) NOT NULL,
	"provider_type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."notification_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"queue_id" uuid,
	"channel_type" varchar(50) NOT NULL,
	"to_address" varchar(500) NOT NULL,
	"subject" text,
	"body_preview" text,
	"status" varchar(50) NOT NULL,
	"provider_used" varchar(100),
	"provider_message_id" varchar(255),
	"error_message" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"user_id" uuid NOT NULL,
	"channel_type" varchar(50) NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."notification_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"channel_type" varchar(50) NOT NULL,
	"channel_id" uuid,
	"template_id" uuid,
	"to_address" varchar(500) NOT NULL,
	"subject" text,
	"body" text,
	"variables_used_json" jsonb,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"priority" integer DEFAULT 0,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3,
	"last_error" text,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"channel_type" varchar(50) NOT NULL,
	"template_key" varchar(150) NOT NULL,
	"subject_template" text NOT NULL,
	"body_template" text NOT NULL,
	"variables_json" jsonb DEFAULT '[]'::jsonb,
	"locale" varchar(10) DEFAULT 'en',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"last_four_chars" varchar(4) NOT NULL,
	"scopes_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_currencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"iso_code" varchar(3) NOT NULL,
	"name" varchar(100) NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"is_base_currency" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"from_currency_id" uuid NOT NULL,
	"to_currency_id" uuid NOT NULL,
	"rate" numeric(15, 6) NOT NULL,
	"effective_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"iso_code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_system_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid,
	"module_name" varchar(100) NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"entity_name" varchar(100) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"old_values_json" jsonb,
	"new_values_json" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"translation_key" varchar(255) NOT NULL,
	"translation_value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_webhook_delivery_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"webhook_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload_json" jsonb NOT NULL,
	"attempt_number" integer DEFAULT 1,
	"response_status_code" integer,
	"response_body" text,
	"status" varchar(50) DEFAULT 'PENDING',
	"executed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_webhook_events" (
	"webhook_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	CONSTRAINT "tenant_webhook_events_webhook_id_event_type_pk" PRIMARY KEY("webhook_id","event_type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"endpoint_url" text NOT NULL,
	"secret_key" varchar(255),
	"is_active" boolean DEFAULT true,
	"max_retries" integer DEFAULT 3,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."global_system_parameters" (
	"param_key" varchar(100) PRIMARY KEY NOT NULL,
	"param_value" text NOT NULL,
	"description" text,
	"data_type" varchar(50) DEFAULT 'STRING',
	"is_public" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."installed_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE',
	"installed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"configuration_json" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."system_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon_svg" text,
	"category" varchar(50),
	"is_core" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"version" varchar(20) DEFAULT '1.0.0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_tax_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tax_name" varchar(100) NOT NULL,
	"tax_percentage" numeric(5, 2) NOT NULL,
	"description" text,
	"tax_type" varchar(50) DEFAULT 'SALES',
	"debit_account_id" uuid,
	"credit_account_id" uuid,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."event_dead_letters" (
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
CREATE TABLE IF NOT EXISTS "tenants"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."outbox_events" (
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
CREATE TABLE IF NOT EXISTS "tenants"."branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"is_active" boolean DEFAULT true,
	"is_headquarters" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_branding" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"logo_url" text,
	"favicon_url" text,
	"primary_color" varchar(20) DEFAULT '#3B82F6',
	"secondary_color" varchar(20) DEFAULT '#1E293B',
	"custom_domain" varchar(255),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"domain" varchar(255) NOT NULL,
	"ssl_status" varchar(50) DEFAULT 'PENDING',
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_features" (
	"tenant_id" uuid NOT NULL,
	"feature_code" varchar(100) NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"enabled_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_features_tenant_id_feature_code_pk" PRIMARY KEY("tenant_id","feature_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_saas_snapshot" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"platform_subscription_id" uuid,
	"platform_plan_id" uuid,
	"plan_slug" varchar(120),
	"plan_display_name" varchar(255),
	"subscription_status" varchar(32),
	"current_period_end" timestamp with time zone,
	"platform_invoice_id" uuid,
	"invoice_number" varchar(128),
	"invoice_status" varchar(24),
	"invoice_total_minor" bigint,
	"invoice_currency" varchar(3),
	"invoice_payment_state" varchar(24) DEFAULT 'UNKNOWN' NOT NULL,
	"paid_in_full" boolean DEFAULT false NOT NULL,
	"last_payment_at" timestamp with time zone,
	"external_subscription_ref" varchar(255),
	"external_invoice_ref" varchar(255),
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_usage_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"metric_name" varchar(100) NOT NULL,
	"current_value" bigint DEFAULT 0 NOT NULL,
	"limit_value" bigint,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"legal_name" varchar(255),
	"tax_id" varchar(100),
	"tax_regime" varchar(100),
	"legal_address" text,
	"city" varchar(100),
	"postal_code" varchar(20),
	"industry_type" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE',
	"timezone" varchar(100) DEFAULT 'UTC',
	"currency_code" varchar(10) DEFAULT 'USD',
	"owner_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."event_dead_letters" (
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
CREATE TABLE IF NOT EXISTS "users"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."outbox_events" (
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
CREATE UNIQUE INDEX IF NOT EXISTS "idx_permissions_module_action" ON "iam"."permissions" ("module","action");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_roles_tenant_name" ON "iam"."roles" ("tenant_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tenant_currencies_tenant_iso" ON "tenants"."tenant_currencies" ("tenant_id","iso_code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tenant_languages_tenant_iso" ON "tenants"."tenant_languages" ("tenant_id","iso_code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tenant_translations_key" ON "tenants"."tenant_translations" ("tenant_id","language_id","translation_key");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_installed_modules_tenant_module" ON "tenants"."installed_modules" ("tenant_id","module_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tenant_taxes_tenant_name" ON "tenants"."tenant_tax_configurations" ("tenant_id","tax_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_usage_metric_period" ON "tenants"."tenant_usage_metrics" ("tenant_id","metric_name","period_start");