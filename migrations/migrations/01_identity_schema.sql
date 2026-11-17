-- ==============================================================================
-- MICROSERVICIO: IDENTITY SERVICE (identity-db)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Autenticación, Usuarios, RBAC, Sesiones, MFA, Seguridad
-- ==============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Para hashing si es necesario a nivel DB

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- 1. USUARIOS Y AUTENTICACIÓN (Con Perfiles Polimórficos)
-- ==============================================================================
-- Lógica: Separación estricta entre credenciales de acceso (users) y 
-- los datos del perfil (persona natural o empresa).

CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL, -- FK Lógica al tenant-service
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    
    -- Relación Polimórfica al Perfil (Natural o Empresa)
    "profile_id" UUID NOT NULL,
    "profile_type" VARCHAR(50) NOT NULL CHECK ("profile_type" IN ('NATURAL_PERSON', 'LEGAL_ENTITY')),
    
    "status" VARCHAR(20) DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED')),
    "is_email_verified" BOOLEAN DEFAULT false,
    "failed_login_attempts" INT DEFAULT 0,
    "locked_until" TIMESTAMPTZ,
    "last_login_at" TIMESTAMPTZ,
    "manager_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "email")
);

CREATE TABLE "natural_person_profiles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "identification_number" VARCHAR(50) UNIQUE, -- DNI, Cédula
    "phone" VARCHAR(50),
    "country_code" VARCHAR(5), -- Ej: 'CO', 'MX', 'US'
    "preferred_language" VARCHAR(5) DEFAULT 'es',
    "timezone" VARCHAR(100) DEFAULT 'America/Bogota',
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "legal_entity_profiles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "legal_name" VARCHAR(255) NOT NULL,
    "commercial_name" VARCHAR(255),
    "tax_id" VARCHAR(50) UNIQUE NOT NULL, -- NIT, RFC, EIN
    "legal_address" TEXT,
    "country_code" VARCHAR(5),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. MFA (Multi-Factor Authentication)
-- ==============================================================================

CREATE TABLE "mfa_methods" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" VARCHAR(50) NOT NULL CHECK ("type" IN ('TOTP', 'SMS', 'EMAIL')),
    "secret" VARCHAR(255) NOT NULL, -- Encriptado en la app
    "is_primary" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "mfa_recovery_codes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "code_hash" VARCHAR(255) NOT NULL,
    "is_used" BOOLEAN DEFAULT false,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. RBAC GRANULAR (Roles y Permisos)
-- ==============================================================================

CREATE TABLE "roles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_system_role" BOOLEAN DEFAULT false, -- Roles inmutables (Ej: 'Super Admin')
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "name")
);

CREATE TABLE "permissions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "module" VARCHAR(100) NOT NULL, -- Ej: 'sales', 'inventory', 'crm'
    "action" VARCHAR(100) NOT NULL, -- Ej: 'create', 'read', 'update', 'delete', 'approve'
    "description" TEXT,
    UNIQUE("module", "action")
);

CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "permission_id" UUID NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
    PRIMARY KEY ("role_id", "permission_id")
);

-- Asignación de roles a usuarios (Soporta roles por sucursal)
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID, -- FK Lógica al tenant-service (Si es NULL, el rol aplica a toda la empresa)
    "granted_at" TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY ("user_id", "role_id", "branch_id")
);

-- ==============================================================================
-- 4. CONTROL DE SESIONES Y SEGURIDAD
-- ==============================================================================

CREATE TABLE "sessions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT,
    "device_id" VARCHAR(255),
    "expires_at" TIMESTAMPTZ NOT NULL,
    "is_revoked" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "ip_restrictions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE, -- Si es NULL, aplica a todo el tenant
    "ip_address" VARCHAR(50) NOT NULL,
    "type" VARCHAR(20) DEFAULT 'ALLOW' CHECK ("type" IN ('ALLOW', 'DENY')),
    "description" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS Y RLS
-- ==============================================================================
CREATE TRIGGER upd_users BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_roles BEFORE UPDATE ON "roles" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Índices de Rendimiento
CREATE INDEX "idx_users_tenant_email" ON "users"("tenant_id", "email");
CREATE INDEX "idx_users_profile_poly" ON "users"("profile_id", "profile_type");
CREATE INDEX "idx_sessions_user_token" ON "sessions"("user_id", "refresh_token_hash");
CREATE INDEX "idx_user_roles_tenant" ON "user_roles"("tenant_id", "user_id");

-- RLS (Row-Level Security)
DO $$ 
DECLARE t text;
BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('users', 'natural_person_profiles', 'legal_entity_profiles', 'mfa_methods', 'roles', 'user_roles', 'sessions', 'ip_restrictions')
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
