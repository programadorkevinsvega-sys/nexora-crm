CREATE TABLE IF NOT EXISTS "discount_approval_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "min_discount_pct" numeric(5,2) NOT NULL,
  "max_discount_pct" numeric(5,2) NOT NULL,
  "approver_role" varchar(50) DEFAULT 'SALES_MANAGER' NOT NULL,
  "requires_strict_approval" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "discount_rules_tenant_idx" ON "discount_approval_rules" ("tenant_id");

CREATE TABLE IF NOT EXISTS "quote_approval_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "quote_id" uuid NOT NULL,
  "requested_discount_pct" numeric(5,2) NOT NULL,
  "status" varchar(30) DEFAULT 'PENDING' NOT NULL,
  "requested_by_user_id" uuid,
  "reviewed_by_user_id" uuid,
  "review_notes" text,
  "reviewed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "quote_req_tenant_idx" ON "quote_approval_requests" ("tenant_id");
CREATE INDEX IF NOT EXISTS "quote_req_quote_idx" ON "quote_approval_requests" ("tenant_id", "quote_id");

CREATE TABLE IF NOT EXISTS "customer_quote_acceptances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "quote_id" uuid NOT NULL,
  "security_token" varchar(255) NOT NULL UNIQUE,
  "client_signer_name" varchar(255),
  "client_signer_email" varchar(255),
  "client_ip_address" varchar(100),
  "status" varchar(30) DEFAULT 'VIEWED' NOT NULL,
  "feedback" text,
  "accepted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "quote_acc_tenant_idx" ON "customer_quote_acceptances" ("tenant_id");
CREATE INDEX IF NOT EXISTS "quote_acc_token_idx" ON "customer_quote_acceptances" ("security_token");
