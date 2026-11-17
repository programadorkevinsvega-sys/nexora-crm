CREATE TABLE IF NOT EXISTS "social_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "platform" varchar(20) NOT NULL,
  "post_type" varchar(30) NOT NULL,
  "post_id" varchar(255) NOT NULL,
  "post_title" text,
  "author_id" varchar(255) NOT NULL,
  "author_name" varchar(255) NOT NULL,
  "author_avatar_url" text,
  "comment_id" varchar(255) NOT NULL,
  "parent_comment_id" varchar(255),
  "message" text NOT NULL,
  "sentiment" varchar(20) DEFAULT 'NEUTRAL' NOT NULL,
  "status" varchar(30) DEFAULT 'PENDING' NOT NULL,
  "reply_message" text,
  "replied_at" timestamp with time zone,
  "replied_by" varchar(20),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "social_comments_tenant_idx" ON "social_comments" ("tenant_id");
CREATE INDEX IF NOT EXISTS "social_comments_platform_idx" ON "social_comments" ("tenant_id", "platform");
CREATE INDEX IF NOT EXISTS "social_comments_status_idx" ON "social_comments" ("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "social_comments_comment_id_idx" ON "social_comments" ("comment_id");

CREATE TABLE IF NOT EXISTS "social_auto_responder_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "platform" varchar(20) DEFAULT 'ALL' NOT NULL,
  "trigger_keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "response_mode" varchar(30) DEFAULT 'STATIC_TEMPLATE' NOT NULL,
  "static_replies" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "ai_prompt" text,
  "send_private_dm" boolean DEFAULT false NOT NULL,
  "auto_create_lead" boolean DEFAULT true NOT NULL,
  "pipeline_id" uuid,
  "stage_id" uuid,
  "target_post_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "knowledge_category_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "social_rules_tenant_idx" ON "social_auto_responder_rules" ("tenant_id");
CREATE INDEX IF NOT EXISTS "social_rules_platform_idx" ON "social_auto_responder_rules" ("tenant_id", "platform");
