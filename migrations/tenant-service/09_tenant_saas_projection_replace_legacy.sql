-- ==============================================================================
-- Reemplaza catálogo SaaS duplicado (subscriptions / planes en tenant-db) por
-- tenant_saas_snapshot. Idempotente: seguro si 01 ya creó solo la proyección.
-- ==============================================================================

BEGIN;

DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "subscription_plan_prices" CASCADE;
DROP TABLE IF EXISTS "subscription_plans" CASCADE;

CREATE TABLE IF NOT EXISTS "tenant_saas_snapshot" (
    "tenant_id" UUID PRIMARY KEY REFERENCES "tenants"("id") ON DELETE CASCADE,
    "platform_subscription_id" UUID,
    "platform_plan_id" UUID,
    "plan_slug" VARCHAR(120),
    "plan_display_name" VARCHAR(255),
    "subscription_status" VARCHAR(32) CHECK ("subscription_status" IS NULL OR "subscription_status" IN ('DRAFT', 'TRIAL', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELED', 'EXPIRED', 'UNKNOWN')),
    "current_period_end" TIMESTAMPTZ,
    "platform_invoice_id" UUID,
    "invoice_number" VARCHAR(128),
    "invoice_status" VARCHAR(24) CHECK ("invoice_status" IS NULL OR "invoice_status" IN ('DRAFT', 'ISSUED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'VOID', 'OVERDUE', 'UNKNOWN')),
    "invoice_total_minor" BIGINT CHECK ("invoice_total_minor" IS NULL OR "invoice_total_minor" >= 0),
    "invoice_currency" CHAR(3),
    "invoice_payment_state" VARCHAR(24) NOT NULL DEFAULT 'UNKNOWN' CHECK ("invoice_payment_state" IN ('NO_INVOICE', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'UNKNOWN')),
    "paid_in_full" BOOLEAN NOT NULL DEFAULT FALSE,
    "last_payment_at" TIMESTAMPTZ,
    "external_subscription_ref" VARCHAR(255),
    "external_invoice_ref" VARCHAR(255),
    "synced_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_tenant_saas_snapshot_subscription" ON "tenant_saas_snapshot" ("platform_subscription_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_saas_snapshot_invoice" ON "tenant_saas_snapshot" ("platform_invoice_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_saas_snapshot_payment" ON "tenant_saas_snapshot" ("paid_in_full", "invoice_payment_state");

DROP TRIGGER IF EXISTS "upd_tenant_saas_snapshot" ON "tenant_saas_snapshot";
CREATE TRIGGER "upd_tenant_saas_snapshot" BEFORE UPDATE ON "tenant_saas_snapshot" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE "tenant_saas_snapshot" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "tenant_saas_snapshot";
CREATE POLICY "tenant_isolation" ON "tenant_saas_snapshot" AS RESTRICTIVE FOR ALL
USING ("tenant_id" = current_setting('app.current_tenant_id', true)::uuid)
WITH CHECK ("tenant_id" = current_setting('app.current_tenant_id', true)::uuid);

COMMIT;
