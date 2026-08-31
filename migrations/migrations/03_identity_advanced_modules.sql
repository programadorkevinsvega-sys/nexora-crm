-- ==============================================================================
-- MICROSERVICIO: IDENTITY SERVICE (identity-db) - MÓDULOS AVANZADOS
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. OAUTH2 Y SINGLE SIGN-ON (SSO) ENTERPRISE
-- ==============================================================================

CREATE TABLE "oauth_providers" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "provider_name" VARCHAR(50) NOT NULL, -- 'GOOGLE', 'MICROSOFT', 'SAML', 'OKTA'
    "client_id" VARCHAR(255) NOT NULL,
    "client_secret" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "provider_name")
);

CREATE TABLE "user_oauth_links" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "provider_name" VARCHAR(50) NOT NULL,
    "provider_user_id" VARCHAR(255) NOT NULL, -- ID devuelto por Google/Microsoft
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("provider_name", "provider_user_id")
);

-- ==============================================================================
-- 2. POLÍTICAS DE CONTRASEÑAS (Compliance)
-- ==============================================================================

CREATE TABLE "password_policies" (
    "tenant_id" UUID PRIMARY KEY, -- 1 a 1 con tenant
    "min_length" INT DEFAULT 8,
    "require_uppercase" BOOLEAN DEFAULT true,
    "require_numbers" BOOLEAN DEFAULT true,
    "require_symbols" BOOLEAN DEFAULT true,
    "expire_days" INT DEFAULT 90, -- Obligar a cambiar cada X días
    "prevent_reuse_last_n" INT DEFAULT 3, -- No repetir las últimas 3 contraseñas
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Historial para evitar reutilización
CREATE TABLE "password_history" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES Y RLS
-- ==============================================================================
CREATE INDEX CONCURRENTLY "idx_user_oauth_user" ON "user_oauth_links"("user_id");
CREATE INDEX CONCURRENTLY "idx_pwd_history_user" ON "password_history"("user_id", "created_at" DESC);

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('oauth_providers', 'user_oauth_links', 'password_policies', 'password_history') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
