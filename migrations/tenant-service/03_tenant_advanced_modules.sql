-- ==============================================================================
-- MICROSERVICIO: TENANT SERVICE (tenant-db) - MÓDULOS AVANZADOS
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. LÍMITES DE USO (Quotas y Facturación SaaS)
-- ==============================================================================

CREATE TABLE "tenant_usage_metrics" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "metric_name" VARCHAR(100) NOT NULL, -- Ej: 'api_calls', 'storage_bytes', 'active_users'
    "current_value" BIGINT NOT NULL DEFAULT 0,
    "limit_value" BIGINT, -- NULL = Ilimitado
    "period_start" TIMESTAMPTZ NOT NULL,
    "period_end" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "metric_name", "period_start")
);

-- ==============================================================================
-- 2. DOMINIOS PERSONALIZADOS (Custom Domains)
-- ==============================================================================

CREATE TABLE "tenant_domains" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "domain" VARCHAR(255) NOT NULL, -- Ej: 'app.miempresa.com'
    "ssl_status" VARCHAR(50) DEFAULT 'PENDING' CHECK ("ssl_status" IN ('PENDING', 'ACTIVE', 'FAILED')),
    "is_primary" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("domain")
);

-- ==============================================================================
-- ÍNDICES Y RLS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS "idx_usage_tenant" ON "tenant_usage_metrics" ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_domains_tenant" ON "tenant_domains" ("tenant_id");

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('tenant_usage_metrics', 'tenant_domains') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
