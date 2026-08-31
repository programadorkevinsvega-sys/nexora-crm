-- ==============================================================================
-- MICROSERVICIO: TENANT SERVICE (EXPANSION)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Configuración Global de Parámetros
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
-- 7. PARÁMETROS GENERALES DEL SISTEMA
-- ==============================================================================
-- Lógica: Configuraciones globales clave-valor que afectan a todo el SaaS.

CREATE TABLE "global_system_parameters" (
    "param_key" VARCHAR(100) PRIMARY KEY, -- Ej: 'MAX_UPLOAD_SIZE_MB', 'DEFAULT_CURRENCY'
    "param_value" TEXT NOT NULL,
    "description" TEXT,
    "data_type" VARCHAR(50) DEFAULT 'STRING' CHECK ("data_type" IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
    "is_public" BOOLEAN DEFAULT false, -- Si el frontend puede leerlo sin auth
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER upd_global_system_parameters BEFORE UPDATE ON "global_system_parameters" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Nota: Esta tabla es global, no lleva RLS por Tenant.

COMMIT;
