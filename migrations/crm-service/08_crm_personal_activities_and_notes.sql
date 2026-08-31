-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE (EXPANSION)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Actividades, Notas, Llamadas, Tareas y Mascotas (Personal CRM)
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
-- 1. NOTAS Y DIARIOS (Notes & Journal Entries)
-- ==============================================================================
-- Lógica: Registro de información cualitativa sobre el contacto.

CREATE TABLE "crm_contact_notes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    
    "body" TEXT NOT NULL,
    "is_favorite" BOOLEAN DEFAULT false,
    "favorited_at" TIMESTAMPTZ,
    
    "created_by_user_id" UUID, -- Agente que creó la nota
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. ACTIVIDADES COMPARTIDAS (Shared Activities)
-- ==============================================================================
-- Lógica: Eventos o actividades que el usuario hizo junto con el contacto (Ej: "Cena de negocios").

CREATE TABLE "crm_activities" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    
    "activity_type" VARCHAR(100), -- Ej: 'MEETING', 'DINNER', 'SPORTS', 'PARTY'
    "summary" VARCHAR(255) NOT NULL,
    "description" TEXT,
    
    "happened_at" DATE NOT NULL,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla pivote (Una actividad puede involucrar a múltiples contactos)
CREATE TABLE "crm_activity_contacts" (
    "activity_id" UUID NOT NULL REFERENCES "crm_activities"("id") ON DELETE CASCADE,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    "tenant_id" UUID NOT NULL,
    PRIMARY KEY ("activity_id", "contact_id")
);

-- ==============================================================================
-- 3. REGISTRO DE LLAMADAS (Call Logs)
-- ==============================================================================

CREATE TABLE "crm_call_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    
    "called_at" TIMESTAMPTZ NOT NULL,
    "content" TEXT, -- Resumen de la llamada
    
    "contact_called_me" BOOLEAN NOT NULL DEFAULT false, -- True si fue Inbound, False si fue Outbound
    "duration_seconds" INT,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TAREAS ASOCIADAS A CONTACTOS (Tasks)
-- ==============================================================================

CREATE TABLE "crm_contact_tasks" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID REFERENCES "contacts"("id") ON DELETE CASCADE, -- Opcional, puede ser una tarea general
    
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    
    "is_completed" BOOLEAN DEFAULT false,
    "completed_at" TIMESTAMPTZ,
    "due_date" TIMESTAMPTZ,
    
    "assigned_to_user_id" UUID, -- Agente responsable
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. MASCOTAS (Pets)
-- ==============================================================================
-- Lógica: Un detalle ultra-personalizado que genera mucha empatía en ventas B2C de alto valor.

CREATE TABLE "crm_contact_pets" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    
    "pet_category" VARCHAR(100) NOT NULL, -- Ej: 'DOG', 'CAT', 'BIRD'
    "name" VARCHAR(255) NOT NULL,
    "breed" VARCHAR(100),
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS, ÍNDICES Y RLS
-- ==============================================================================

CREATE TRIGGER upd_crm_contact_notes BEFORE UPDATE ON "crm_contact_notes" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_activities BEFORE UPDATE ON "crm_activities" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_call_logs BEFORE UPDATE ON "crm_call_logs" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_contact_tasks BEFORE UPDATE ON "crm_contact_tasks" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_contact_pets BEFORE UPDATE ON "crm_contact_pets" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX CONCURRENTLY "idx_crm_notes_contact" ON "crm_contact_notes"("contact_id");
CREATE INDEX CONCURRENTLY "idx_crm_calls_contact" ON "crm_call_logs"("contact_id", "called_at");
CREATE INDEX CONCURRENTLY "idx_crm_tasks_contact" ON "crm_contact_tasks"("contact_id", "is_completed");

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('crm_contact_notes', 'crm_activities', 'crm_activity_contacts', 'crm_call_logs', 'crm_contact_tasks', 'crm_contact_pets') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
