-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE (HELPDESK ITSM EXPANSION)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: SLAs, Estados Dinámicos, Métricas de Agentes y Auditoría
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
-- 1. ESTADOS, PRIORIDADES Y CATEGORÍAS DINÁMICAS (ITSM Configuration)
-- ==============================================================================
-- Lógica: Reemplaza los ENUMs estáticos por tablas dinámicas configurables por tenant.

CREATE TABLE "crm_helpdesk_ticket_statuses" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL, -- Ej: 'Abierto', 'En Progreso', 'Esperando al Cliente'
    "color_hex" VARCHAR(20) DEFAULT '#3498db',
    "is_closed_state" BOOLEAN DEFAULT false, -- Indica si este estado significa que el ticket terminó
    "sort_order" INT DEFAULT 0,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "name")
);

CREATE TABLE "crm_helpdesk_ticket_priorities" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL, -- Ej: 'Baja', 'Media', 'Alta', 'Crítica'
    "level" INT NOT NULL DEFAULT 1, -- Para ordenamiento
    "color_hex" VARCHAR(20) DEFAULT '#3498db',
    "sla_resolution_hours" INT, -- Tiempo esperado de resolución (SLA)
    "sla_first_response_hours" INT, -- Tiempo esperado para primera respuesta (SLA)
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "name")
);

CREATE TABLE "crm_helpdesk_ticket_categories" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL, -- Ej: 'Soporte Técnico', 'Facturación'
    "description" TEXT,
    "icon" VARCHAR(50),
    "color_hex" VARCHAR(20) DEFAULT '#3498db',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "name")
);

-- ==============================================================================
-- 2. EXPANSIÓN DE CONVERSACIONES (SLA & Time Tracking)
-- ==============================================================================

ALTER TABLE "crm_helpdesk_conversations"
ADD COLUMN "dynamic_status_id" UUID REFERENCES "crm_helpdesk_ticket_statuses"("id") ON DELETE SET NULL,
ADD COLUMN "dynamic_priority_id" UUID REFERENCES "crm_helpdesk_ticket_priorities"("id") ON DELETE SET NULL,
ADD COLUMN "category_id" UUID REFERENCES "crm_helpdesk_ticket_categories"("id") ON DELETE SET NULL,

-- SLA y Tracking de Tiempo
ADD COLUMN "estimated_hours" NUMERIC(8,2),
ADD COLUMN "worked_hours" NUMERIC(8,2) DEFAULT 0.00,
ADD COLUMN "due_date" TIMESTAMPTZ, -- Fecha de vencimiento según SLA
ADD COLUMN "first_response_at" TIMESTAMPTZ,
ADD COLUMN "resolved_at" TIMESTAMPTZ,

-- Flags de ITSM
ADD COLUMN "is_internal" BOOLEAN DEFAULT false,
ADD COLUMN "requires_approval" BOOLEAN DEFAULT false;

-- ==============================================================================
-- 3. MÉTRICAS Y DISPONIBILIDAD DE AGENTES (Agent Performance)
-- ==============================================================================
-- Lógica: Extensión del perfil de usuario específicamente para el módulo de Helpdesk.

CREATE TABLE "crm_helpdesk_agent_profiles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL, -- FK lógica a identity-service
    
    "is_available" BOOLEAN DEFAULT true,
    "agent_status" VARCHAR(50) DEFAULT 'AVAILABLE' CHECK ("agent_status" IN ('AVAILABLE', 'BUSY', 'AWAY', 'ON_VACATION')),
    
    "assigned_categories_json" JSONB DEFAULT '[]'::jsonb, -- IDs de categorías que puede atender
    
    -- Métricas en tiempo real e históricas
    "active_tickets_count" INT DEFAULT 0,
    "resolved_tickets_count" INT DEFAULT 0,
    "average_resolution_hours" NUMERIC(8,2),
    "average_first_response_hours" NUMERIC(8,2),
    
    "last_assigned_at" TIMESTAMPTZ,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "user_id")
);

-- ==============================================================================
-- 4. AUDITORÍA DE TICKETS (Ticket Audit Trail)
-- ==============================================================================
-- Lógica: Historial inmutable de qué cambió, quién lo cambió y cuándo.

CREATE TABLE "crm_helpdesk_ticket_audits" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL REFERENCES "crm_helpdesk_conversations"("id") ON DELETE CASCADE,
    "user_id" UUID, -- Quién hizo el cambio (puede ser NULL si fue el sistema)
    
    "action_type" VARCHAR(100) NOT NULL, -- Ej: 'STATUS_CHANGED', 'ASSIGNEE_CHANGED', 'SLA_BREACHED'
    "old_value" TEXT,
    "new_value" TEXT,
    "details_json" JSONB DEFAULT '{}'::jsonb,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS, ÍNDICES Y RLS
-- ==============================================================================

CREATE TRIGGER upd_crm_helpdesk_ticket_statuses BEFORE UPDATE ON "crm_helpdesk_ticket_statuses" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_helpdesk_ticket_priorities BEFORE UPDATE ON "crm_helpdesk_ticket_priorities" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_helpdesk_ticket_categories BEFORE UPDATE ON "crm_helpdesk_ticket_categories" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_helpdesk_agent_profiles BEFORE UPDATE ON "crm_helpdesk_agent_profiles" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX CONCURRENTLY "idx_hd_conv_dyn_status" ON "crm_helpdesk_conversations"("dynamic_status_id");
CREATE INDEX CONCURRENTLY "idx_hd_conv_due_date" ON "crm_helpdesk_conversations"("due_date");
CREATE INDEX CONCURRENTLY "idx_hd_agent_status" ON "crm_helpdesk_agent_profiles"("agent_status");
CREATE INDEX CONCURRENTLY "idx_hd_audits_conv" ON "crm_helpdesk_ticket_audits"("conversation_id", "created_at");

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('crm_helpdesk_ticket_statuses', 'crm_helpdesk_ticket_priorities', 'crm_helpdesk_ticket_categories', 'crm_helpdesk_agent_profiles', 'crm_helpdesk_ticket_audits') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
