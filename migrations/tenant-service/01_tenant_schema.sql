-- ==============================================================================
-- MICROSERVICIO: TENANT SERVICE (tenant-db)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Empresas, Sucursales, Branding, Feature Flags y **proyección** SaaS plataforma (solo refs + estado de pago).
-- ==============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- 1. EMPRESAS (TENANTS) Y SUCURSALES
-- ==============================================================================

CREATE TABLE "tenants" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "legal_name" VARCHAR(255),
    "tax_id" VARCHAR(100), -- RFC, NIT, EIN
    "tax_regime" VARCHAR(100), -- Régimen fiscal
    "legal_address" TEXT,
    "city" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "industry_type" VARCHAR(100) NOT NULL, -- Ej: 'RESTAURANT', 'PHARMACY', 'RETAIL'
    "status" VARCHAR(50) DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'TRIAL')),
    "timezone" VARCHAR(100) DEFAULT 'UTC',
    "currency_code" VARCHAR(10) DEFAULT 'USD',
    "owner_user_id" UUID NOT NULL, -- FK Lógica al identity-service
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "branches" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50), -- Código interno de la sucursal
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "is_active" BOOLEAN DEFAULT true,
    "is_headquarters" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. BRANDING (White-label)
-- ==============================================================================

CREATE TABLE "tenant_branding" (
    "tenant_id" UUID PRIMARY KEY REFERENCES "tenants"("id") ON DELETE CASCADE,
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "primary_color" VARCHAR(20) DEFAULT '#3B82F6', -- Azul Enterprise por defecto
    "secondary_color" VARCHAR(20) DEFAULT '#1E293B',
    "custom_domain" VARCHAR(255),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. PROYECCIÓN SaaS PLATAFORMA (read-model local; canonical en admin-platform-*)
-- ==============================================================================
-- Solo guarda QUÉ plan/suscripción/factura corresponde al tenant y SI está pagado.
-- NO catálogo de planes ni precios: eso vive en platform-subscription-service / billing / invoice.

CREATE TABLE "tenant_saas_snapshot" (
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

COMMENT ON TABLE "tenant_saas_snapshot" IS 'Espejo operativo: IDs en platform-subscription-db / platform-invoice-db. Actualizar vía eventos o jobs; no duplicar catálogo de planes.';

CREATE INDEX "idx_tenant_saas_snapshot_subscription" ON "tenant_saas_snapshot" ("platform_subscription_id");
CREATE INDEX "idx_tenant_saas_snapshot_invoice" ON "tenant_saas_snapshot" ("platform_invoice_id");
CREATE INDEX "idx_tenant_saas_snapshot_payment" ON "tenant_saas_snapshot" ("paid_in_full", "invoice_payment_state");

-- ==============================================================================
-- 4. FEATURE FLAGS (Module Registry)
-- ==============================================================================
-- Esta es la tabla clave mencionada en requerimientos.md para cargar módulos dinámicamente

CREATE TABLE "tenant_features" (
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "feature_code" VARCHAR(100) NOT NULL, -- Ej: 'restaurant.kds', 'pharmacy.expiration', 'core.crm'
    "is_enabled" BOOLEAN DEFAULT true,
    "enabled_at" TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY ("tenant_id", "feature_code")
);

-- ==============================================================================
-- TRIGGERS Y RLS
-- ==============================================================================
CREATE TRIGGER upd_tenants BEFORE UPDATE ON "tenants" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_branches BEFORE UPDATE ON "branches" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_branding BEFORE UPDATE ON "tenant_branding" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_tenant_saas_snapshot BEFORE UPDATE ON "tenant_saas_snapshot" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Índices
CREATE INDEX "idx_branches_tenant" ON "branches"("tenant_id");

-- RLS (Aislamiento de Tenant)
DO $$
DECLARE t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('branches', 'tenant_branding', 'tenant_features', 'tenant_saas_snapshot')
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
