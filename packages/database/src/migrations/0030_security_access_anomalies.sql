CREATE TABLE IF NOT EXISTS "security_access_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "user_id" uuid,
  "ip_address" varchar(100) NOT NULL,
  "user_agent" text,
  "country" varchar(100) DEFAULT 'Colombia',
  "city" varchar(100) DEFAULT 'Bogotá',
  "login_status" varchar(30) DEFAULT 'SUCCESS' NOT NULL,
  "failure_reason" varchar(255),
  "is_suspicious" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "sec_logs_tenant_idx" ON "security_access_logs" ("tenant_id");
CREATE INDEX IF NOT EXISTS "sec_logs_user_idx" ON "security_access_logs" ("tenant_id", "user_id");
CREATE INDEX IF NOT EXISTS "sec_logs_status_idx" ON "security_access_logs" ("tenant_id", "login_status");

CREATE TABLE IF NOT EXISTS "security_anomalies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "user_id" uuid,
  "anomaly_type" varchar(100) DEFAULT 'IMPOSSIBLE_TRAVEL' NOT NULL,
  "severity" varchar(30) DEFAULT 'HIGH' NOT NULL,
  "description" text NOT NULL,
  "details" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "is_resolved" boolean DEFAULT false NOT NULL,
  "resolved_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "sec_anom_tenant_idx" ON "security_anomalies" ("tenant_id");
CREATE INDEX IF NOT EXISTS "sec_anom_sev_idx" ON "security_anomalies" ("tenant_id", "severity");
