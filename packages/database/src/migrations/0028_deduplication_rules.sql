CREATE TABLE IF NOT EXISTS "deduplication_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "entity_type" varchar(50) DEFAULT 'CONTACT' NOT NULL,
  "match_fields" jsonb DEFAULT '["email"]'::jsonb NOT NULL,
  "match_type" varchar(50) DEFAULT 'EXACT' NOT NULL,
  "similarity_threshold" integer DEFAULT 85 NOT NULL,
  "auto_merge_enabled" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "dedup_rules_tenant_idx" ON "deduplication_rules" ("tenant_id");
CREATE INDEX IF NOT EXISTS "dedup_rules_entity_idx" ON "deduplication_rules" ("tenant_id", "entity_type");

CREATE TABLE IF NOT EXISTS "deduplication_audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "entity_type" varchar(50) NOT NULL,
  "master_record_id" uuid NOT NULL,
  "merged_record_id" uuid NOT NULL,
  "matched_by_field" varchar(100) NOT NULL,
  "merged_data_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "merged_by_user_id" uuid,
  "merged_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "dedup_audit_tenant_idx" ON "deduplication_audit_logs" ("tenant_id");
CREATE INDEX IF NOT EXISTS "dedup_audit_master_idx" ON "deduplication_audit_logs" ("tenant_id", "master_record_id");
