CREATE TABLE IF NOT EXISTS "payment_transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "resource_type" varchar(30) NOT NULL,
  "resource_id" uuid NOT NULL,
  "gateway" varchar(30) DEFAULT 'STRIPE' NOT NULL,
  "external_payment_id" varchar(255),
  "payment_url" text NOT NULL,
  "amount" numeric(15, 2) NOT NULL,
  "currency" varchar(10) DEFAULT 'USD' NOT NULL,
  "status" varchar(30) DEFAULT 'PENDING' NOT NULL,
  "customer_email" varchar(255),
  "customer_name" varchar(255),
  "paid_at" timestamp with time zone,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "payment_tx_tenant_idx" ON "payment_transactions" ("tenant_id");
CREATE INDEX IF NOT EXISTS "payment_tx_resource_idx" ON "payment_transactions" ("tenant_id", "resource_type", "resource_id");
CREATE INDEX IF NOT EXISTS "payment_tx_status_idx" ON "payment_transactions" ("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "payment_tx_external_id_idx" ON "payment_transactions" ("external_payment_id");
