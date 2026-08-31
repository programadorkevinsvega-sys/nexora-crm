-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE (EXPANSION)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Relaciones Personales, Eventos de Vida, Regalos y Deudas (Personal CRM)
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
-- 1. RELACIONES ENTRE CONTACTOS (Family, Friends, Colleagues)
-- ==============================================================================
-- Lógica: Permite mapear grafos sociales entre contactos (Ej: "Juan es padre de María").

CREATE TABLE "crm_relationship_types" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL, -- Ej: 'Padre', 'Hijo', 'Esposo', 'Jefe'
    "reverse_name" VARCHAR(100) NOT NULL, -- Ej: 'Hijo' (si name es Padre), 'Esposa'
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "crm_contact_relationships" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    "related_contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    "relationship_type_id" UUID NOT NULL REFERENCES "crm_relationship_types"("id"),
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("contact_id", "related_contact_id", "relationship_type_id")
);

-- ==============================================================================
-- 2. EVENTOS DE VIDA Y FECHAS ESPECIALES (Life Events & Special Dates)
-- ==============================================================================
-- Lógica: Tracking de momentos clave (Aniversarios, graduaciones, cirugías).

CREATE TABLE "crm_life_events" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    
    "event_type" VARCHAR(100) NOT NULL, -- Ej: 'ANNIVERSARY', 'GRADUATION', 'NEW_JOB', 'SURGERY'
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    
    "happened_at" DATE NOT NULL,
    "is_yearly_recurring" BOOLEAN DEFAULT false, -- Si se repite cada año (ej. Aniversario)
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. GESTIÓN DE REGALOS (Gifts)
-- ==============================================================================
-- Lógica: Historial de regalos dados o recibidos para mantener relaciones.

CREATE TABLE "crm_contact_gifts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    
    "direction" VARCHAR(50) DEFAULT 'GIVEN' CHECK ("direction" IN ('GIVEN', 'RECEIVED')),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "url" TEXT, -- Link de compra o referencia
    "estimated_value" NUMERIC(10,2),
    
    "status" VARCHAR(50) DEFAULT 'IDEA' CHECK ("status" IN ('IDEA', 'PURCHASED', 'DELIVERED')),
    "date_given_or_received" DATE,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. DEUDAS PERSONALES (Debts / IOUs)
-- ==============================================================================
-- Lógica: Tracking informal de dinero prestado o debido entre el usuario y el contacto.

CREATE TABLE "crm_contact_debts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    
    "direction" VARCHAR(50) NOT NULL CHECK ("direction" IN ('I_OWE_THEM', 'THEY_OWE_ME')),
    "amount" NUMERIC(15,2) NOT NULL,
    "reason" TEXT NOT NULL,
    
    "status" VARCHAR(50) DEFAULT 'UNPAID' CHECK ("status" IN ('UNPAID', 'PARTIALLY_PAID', 'PAID')),
    "due_date" DATE,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. RECORDATORIOS RECURRENTES (Reminders)
-- ==============================================================================
-- Lógica: Motor de recordatorios para no perder el contacto.

CREATE TABLE "crm_contact_reminders" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    
    "frequency_type" VARCHAR(50) NOT NULL CHECK ("frequency_type" IN ('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
    "frequency_interval" INT DEFAULT 1, -- Ej: Cada 2 semanas
    
    "next_due_date" TIMESTAMPTZ NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS, ÍNDICES Y RLS
-- ==============================================================================

CREATE TRIGGER upd_crm_life_events BEFORE UPDATE ON "crm_life_events" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_contact_gifts BEFORE UPDATE ON "crm_contact_gifts" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_contact_debts BEFORE UPDATE ON "crm_contact_debts" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_contact_reminders BEFORE UPDATE ON "crm_contact_reminders" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX CONCURRENTLY "idx_crm_relationships_contact" ON "crm_contact_relationships"("contact_id");
CREATE INDEX CONCURRENTLY "idx_crm_life_events_contact" ON "crm_life_events"("contact_id", "happened_at");
CREATE INDEX CONCURRENTLY "idx_crm_reminders_due" ON "crm_contact_reminders"("next_due_date", "is_active");

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('crm_relationship_types', 'crm_contact_relationships', 'crm_life_events', 'crm_contact_gifts', 'crm_contact_debts', 'crm_contact_reminders') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
