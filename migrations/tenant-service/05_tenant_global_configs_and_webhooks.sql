-- ==============================================================================
-- MICROSERVICIO: TENANT SERVICE (Expansión)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Configuraciones Globales (Idiomas, Monedas, Webhooks, Logs)
-- SKILL: database-production-architect (Ultra Enterprise)
-- ==============================================================================

BEGIN;

-- (Asumiendo que update_updated_at_column ya existe en este esquema)

-- ==============================================================================
-- 1. LOCALIZACIÓN (Idiomas y Traducciones)
-- ==============================================================================

CREATE TABLE "tenant_languages" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    
    "iso_code" VARCHAR(10) NOT NULL, -- Ej: 'es-CO', 'en-US'
    "name" VARCHAR(100) NOT NULL,
    "is_default" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "iso_code")
);

CREATE TABLE "tenant_translations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "language_id" UUID NOT NULL REFERENCES "tenant_languages"("id") ON DELETE CASCADE,
    
    "translation_key" VARCHAR(255) NOT NULL, -- Ej: 'ui.button.save', 'email.welcome.subject'
    "translation_value" TEXT NOT NULL,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "language_id", "translation_key")
);

-- ==============================================================================
-- 2. FINANZAS GLOBALES (Monedas y Tipos de Cambio)
-- ==============================================================================

CREATE TABLE "tenant_currencies" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    
    "iso_code" VARCHAR(3) NOT NULL, -- Ej: 'COP', 'USD'
    "name" VARCHAR(100) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    
    "is_base_currency" BOOLEAN DEFAULT false, -- Solo una puede ser true por tenant
    "is_active" BOOLEAN DEFAULT true,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "iso_code")
);

CREATE TABLE "tenant_exchange_rates" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "from_currency_id" UUID NOT NULL REFERENCES "tenant_currencies"("id") ON DELETE CASCADE,
    "to_currency_id" UUID NOT NULL REFERENCES "tenant_currencies"("id") ON DELETE CASCADE,
    
    "rate" NUMERIC(15,6) NOT NULL,
    "effective_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. INTEGRACIONES (API Tokens y Webhooks)
-- ==============================================================================

CREATE TABLE "tenant_api_keys" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    
    "name" VARCHAR(255) NOT NULL, -- Ej: 'Integración Facturación Externa'
    "token_hash" VARCHAR(255) NOT NULL UNIQUE, -- Hash seguro del token
    "last_four_chars" VARCHAR(4) NOT NULL,
    
    "scopes_json" JSONB NOT NULL DEFAULT '[]', -- Permisos (ej: ["billing:read", "billing:write"])
    
    "expires_at" TIMESTAMPTZ,
    "last_used_at" TIMESTAMPTZ,
    "is_active" BOOLEAN DEFAULT true,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "tenant_webhooks" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    
    "name" VARCHAR(255) NOT NULL,
    "endpoint_url" TEXT NOT NULL,
    "secret_key" VARCHAR(255), -- Para firmar el payload (HMAC)
    
    "is_active" BOOLEAN DEFAULT true,
    "max_retries" INT DEFAULT 3,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "tenant_webhook_events" (
    "webhook_id" UUID NOT NULL REFERENCES "tenant_webhooks"("id") ON DELETE CASCADE,
    "event_type" VARCHAR(100) NOT NULL, -- Ej: 'invoice.created', 'customer.updated'
    PRIMARY KEY ("webhook_id", "event_type")
);

CREATE TABLE "tenant_webhook_delivery_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "webhook_id" UUID NOT NULL REFERENCES "tenant_webhooks"("id") ON DELETE CASCADE,
    
    "event_type" VARCHAR(100) NOT NULL,
    "payload_json" JSONB NOT NULL,
    
    "attempt_number" INT DEFAULT 1,
    "response_status_code" INT,
    "response_body" TEXT,
    
    "status" VARCHAR(50) DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'SUCCESS', 'FAILED')),
    "executed_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. AUDITORÍA GLOBAL (Logs de cada módulo)
-- ==============================================================================

CREATE TABLE "tenant_system_audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID, -- Puede ser null si fue una acción del sistema/API
    
    "module_name" VARCHAR(100) NOT NULL, -- Ej: 'FINANCE', 'HR', 'CRM'
    "action_type" VARCHAR(100) NOT NULL, -- Ej: 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'
    
    "entity_name" VARCHAR(100) NOT NULL, -- Ej: 'invoice', 'employee'
    "entity_id" VARCHAR(255) NOT NULL,
    
    "old_values_json" JSONB,
    "new_values_json" JSONB,
    
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS, ÍNDICES Y RLS
-- ==============================================================================

CREATE TRIGGER upd_tenant_languages BEFORE UPDATE ON "tenant_languages" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_tenant_translations BEFORE UPDATE ON "tenant_translations" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_tenant_currencies BEFORE UPDATE ON "tenant_currencies" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_tenant_api_keys BEFORE UPDATE ON "tenant_api_keys" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_tenant_webhooks BEFORE UPDATE ON "tenant_webhooks" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX IF NOT EXISTS "idx_tenant_translations_key" ON "tenant_translations" ("language_id", "translation_key");
CREATE INDEX IF NOT EXISTS "idx_tenant_exchange_rates_date" ON "tenant_exchange_rates" ("from_currency_id", "to_currency_id", "effective_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_tenant_webhook_logs_status" ON "tenant_webhook_delivery_logs" ("webhook_id", "status");
CREATE INDEX IF NOT EXISTS "idx_tenant_audit_logs_entity" ON "tenant_system_audit_logs" ("module_name", "entity_name", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_audit_logs_date" ON "tenant_system_audit_logs" ("created_at" DESC);

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('tenant_languages', 'tenant_translations', 'tenant_currencies', 'tenant_exchange_rates', 'tenant_api_keys', 'tenant_webhooks', 'tenant_webhook_delivery_logs', 'tenant_system_audit_logs') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

ALTER TABLE "tenant_webhook_events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_webhook_events_isolation ON "tenant_webhook_events" AS RESTRICTIVE FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM "tenant_webhooks" tw
        WHERE tw.id = "tenant_webhook_events".webhook_id
          AND tw.tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
);

COMMIT;
