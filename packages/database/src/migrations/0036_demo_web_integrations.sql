CREATE TABLE IF NOT EXISTS "web_forms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL,
  "title" varchar(255) DEFAULT 'Contáctanos' NOT NULL,
  "description" text,
  "fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "button_text" varchar(100) DEFAULT 'Enviar Solicitud' NOT NULL,
  "success_message" text DEFAULT '¡Gracias! Hemos recibido tu información correctamente.' NOT NULL,
  "redirect_url" text,
  "lead_source" varchar(100) DEFAULT 'Formulario Web' NOT NULL,
  "default_lead_status" varchar(50) DEFAULT 'NEW' NOT NULL,
  "default_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "assign_to_user_id" uuid,
  "primary_color" varchar(50) DEFAULT '#06b6d4' NOT NULL,
  "background_color" varchar(50) DEFAULT '#09090b' NOT NULL,
  "text_color" varchar(50) DEFAULT '#f4f4f5' NOT NULL,
  "border_radius" varchar(20) DEFAULT '12px' NOT NULL,
  "custom_css" text,
  "submissions_count" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "web_forms_tenant_slug_idx" ON "web_forms" ("tenant_id", "slug");
CREATE INDEX IF NOT EXISTS "web_forms_tenant_active_idx" ON "web_forms" ("tenant_id", "is_active");

CREATE TABLE IF NOT EXISTS "web_form_submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "form_id" uuid NOT NULL REFERENCES "web_forms" ("id") ON DELETE CASCADE,
  "contact_id" uuid REFERENCES "contacts" ("id") ON DELETE SET NULL,
  "payload_json" jsonb NOT NULL,
  "ip_address" varchar(45),
  "user_agent" text,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "web_form_subs_tenant_form_idx" ON "web_form_submissions" ("tenant_id", "form_id");
CREATE INDEX IF NOT EXISTS "web_form_subs_tenant_submitted_idx" ON "web_form_submissions" ("tenant_id", "submitted_at");

CREATE TABLE IF NOT EXISTS "meta_integrations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "status" varchar(50) DEFAULT 'DISCONNECTED' NOT NULL,
  "meta_app_id" varchar(255),
  "meta_user_id" varchar(255),
  "meta_user_name" varchar(255),
  "access_token" text,
  "token_expires_at" timestamp with time zone,
  "selected_page_id" varchar(255),
  "selected_page_name" varchar(255),
  "page_access_token" text,
  "ad_account_id" varchar(255),
  "ad_account_name" varchar(255),
  "webhook_secret" varchar(255),
  "lead_gen_forms" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "auto_create_deal" boolean DEFAULT true NOT NULL,
  "target_pipeline_id" uuid,
  "target_stage_id" uuid,
  "last_sync_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "meta_integrations_tenant_idx" ON "meta_integrations" ("tenant_id");

CREATE TABLE IF NOT EXISTS "meta_lead_ad_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "meta_integration_id" uuid REFERENCES "meta_integrations" ("id") ON DELETE CASCADE,
  "leadgen_id" varchar(255) NOT NULL,
  "form_id" varchar(255),
  "form_name" varchar(255),
  "ad_id" varchar(255),
  "ad_name" varchar(255),
  "campaign_name" varchar(255),
  "contact_id" uuid REFERENCES "contacts" ("id") ON DELETE SET NULL,
  "deal_id" uuid,
  "lead_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" varchar(50) DEFAULT 'PROCESSED' NOT NULL,
  "error_message" text,
  "received_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "meta_lead_logs_tenant_received_idx" ON "meta_lead_ad_logs" ("tenant_id", "received_at");
CREATE INDEX IF NOT EXISTS "meta_lead_logs_leadgen_idx" ON "meta_lead_ad_logs" ("leadgen_id");
