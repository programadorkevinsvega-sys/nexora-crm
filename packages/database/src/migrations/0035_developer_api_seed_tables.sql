CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(100) NOT NULL,
  "key_hash" varchar(64) NOT NULL,
  "key_prefix" varchar(20) NOT NULL,
  "scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "last_used_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "api_keys_tenant_idx" ON "api_keys" ("tenant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_key_hash_idx" ON "api_keys" ("key_hash");

CREATE TABLE IF NOT EXISTS "webhook_endpoints" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" varchar(100) NOT NULL,
  "url" text NOT NULL,
  "secret" varchar(255) NOT NULL,
  "events" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "webhook_endpoints_tenant_idx" ON "webhook_endpoints" ("tenant_id");

CREATE TABLE IF NOT EXISTS "webhook_delivery_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "endpoint_id" uuid NOT NULL REFERENCES "webhook_endpoints" ("id") ON DELETE CASCADE,
  "event" varchar(100) NOT NULL,
  "payload" jsonb NOT NULL,
  "response_status" integer,
  "response_body" text,
  "duration_ms" integer,
  "attempt" integer DEFAULT 1 NOT NULL,
  "status" varchar(30) DEFAULT 'PENDING' NOT NULL,
  "delivered_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "webhook_delivery_logs_tenant_idx" ON "webhook_delivery_logs" ("tenant_id");
CREATE INDEX IF NOT EXISTS "webhook_delivery_logs_endpoint_idx" ON "webhook_delivery_logs" ("endpoint_id");
CREATE INDEX IF NOT EXISTS "webhook_delivery_logs_status_idx" ON "webhook_delivery_logs" ("status");
