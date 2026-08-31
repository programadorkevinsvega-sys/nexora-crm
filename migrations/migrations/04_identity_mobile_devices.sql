-- ==============================================================================
-- MICROSERVICIO: IDENTITY SERVICE (Expansión)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Gestión de Dispositivos Móviles y Sesiones
-- SKILL: database-production-architect (Ultra Enterprise)
-- ==============================================================================

BEGIN;

-- (Asumiendo que update_updated_at_column ya existe en este esquema)

-- ==============================================================================
-- 1. DISPOSITIVOS MÓVILES (Para Push Notifications y Seguridad)
-- ==============================================================================

CREATE TABLE "user_mobile_devices" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    
    "device_identifier" VARCHAR(255) NOT NULL, -- UUID único del dispositivo físico
    "platform" VARCHAR(50) NOT NULL CHECK ("platform" IN ('IOS', 'ANDROID', 'WEB', 'OTHER')),
    "device_model" VARCHAR(100), -- Ej: 'iPhone 13 Pro', 'Samsung Galaxy S21'
    "os_version" VARCHAR(50),
    
    "push_notification_token" TEXT, -- Token de FCM (Firebase) o APNs (Apple)
    
    "is_trusted_device" BOOLEAN DEFAULT false, -- Para omitir 2FA
    "last_active_at" TIMESTAMPTZ DEFAULT NOW(),
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("user_id", "device_identifier")
);

-- ==============================================================================
-- TRIGGERS, ÍNDICES Y RLS
-- ==============================================================================

CREATE TRIGGER upd_user_mobile_devices BEFORE UPDATE ON "user_mobile_devices" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX CONCURRENTLY "idx_user_mobile_devices_user" ON "user_mobile_devices"("user_id", "last_active_at" DESC);

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('user_mobile_devices') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
