-- ==============================================================================
-- MICROSERVICIO: TENANT SERVICE (EXPANSION)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Módulos del Marketplace e Impuestos por Empresa
-- SKILL: database-production-architect (Ultra Enterprise)
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- 5. MARKETPLACE DE MÓDULOS (App Store Interna)
-- ==============================================================================
-- Lógica: Catálogo global de módulos que las empresas pueden instalar.

CREATE TABLE "system_modules" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL UNIQUE, -- Ej: 'Punto de Venta', 'Contabilidad'
    "slug" VARCHAR(100) NOT NULL UNIQUE, -- Ej: 'pos', 'accounting'
    "description" TEXT,
    "icon_svg" TEXT,
    "category" VARCHAR(50), -- Ej: 'Ventas', 'Finanzas', 'Operaciones'
    "is_core" BOOLEAN DEFAULT false, -- Si es true, viene instalado por defecto
    "is_active" BOOLEAN DEFAULT true,
    "version" VARCHAR(20) DEFAULT '1.0.0',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Instalación de módulos por empresa
CREATE TABLE "installed_modules" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "module_id" UUID NOT NULL REFERENCES "system_modules"("id") ON DELETE CASCADE,
    
    "status" VARCHAR(50) DEFAULT 'ACTIVE' CHECK ("status" IN ('TRIAL', 'ACTIVE', 'EXPIRED', 'UNINSTALLED')),
    "installed_at" TIMESTAMPTZ DEFAULT NOW(),
    
    "configuration_json" JSONB, -- Configuraciones específicas de la empresa para este módulo
    
    UNIQUE("tenant_id", "module_id")
);

-- ==============================================================================
-- 6. CONFIGURACIÓN DE IMPUESTOS POR EMPRESA
-- ==============================================================================
-- Lógica: Cada empresa define sus propios impuestos según su país/régimen.

CREATE TABLE "tenant_tax_configurations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    
    "tax_name" VARCHAR(100) NOT NULL, -- Ej: 'IVA 19%', 'ISR Retenido'
    "tax_percentage" NUMERIC(5,2) NOT NULL,
    "description" TEXT,
    "tax_type" VARCHAR(50) DEFAULT 'SALES' CHECK ("tax_type" IN ('SALES', 'PURCHASE', 'WITHHOLDING')),
    
    "debit_account_id" UUID, -- FK Lógica a accounting_accounts (cuenta_debito)
    "credit_account_id" UUID, -- FK Lógica a accounting_accounts (cuenta_credito)
    
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE("tenant_id", "tax_name")
);

-- ==============================================================================
-- TRIGGERS, ÍNDICES Y RLS
-- ==============================================================================

CREATE TRIGGER upd_system_modules BEFORE UPDATE ON "system_modules" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_tenant_taxes BEFORE UPDATE ON "tenant_tax_configurations" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX IF NOT EXISTS "idx_installed_modules_tenant" ON "installed_modules" ("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_tenant_taxes_tenant" ON "tenant_tax_configurations" ("tenant_id");

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('installed_modules', 'tenant_tax_configurations') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
