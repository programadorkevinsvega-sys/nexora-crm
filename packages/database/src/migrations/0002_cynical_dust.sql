CREATE SCHEMA "users";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."legal_entity_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"commercial_name" varchar(255),
	"tax_id" varchar(50) NOT NULL,
	"legal_address" text,
	"country_code" varchar(5),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."natural_person_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"identification_number" varchar(50),
	"phone" varchar(50),
	"country_code" varchar(5),
	"preferred_language" varchar(5) DEFAULT 'es',
	"timezone" varchar(100) DEFAULT 'America/Bogota',
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."user_mobile_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"device_identifier" varchar(255) NOT NULL,
	"platform" varchar(50) NOT NULL,
	"device_model" varchar(100),
	"os_version" varchar(50),
	"push_notification_token" text,
	"is_trusted_device" boolean DEFAULT false,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."user_oauth_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider_name" varchar(50) NOT NULL,
	"provider_user_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"profile_id" uuid NOT NULL,
	"profile_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"is_email_verified" boolean DEFAULT false,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"manager_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_mobile_devices_user_device" ON "users"."user_mobile_devices" ("user_id","device_identifier");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_oauth_provider" ON "users"."user_oauth_links" ("provider_name","provider_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_tenant_email" ON "users"."users" ("tenant_id","email");