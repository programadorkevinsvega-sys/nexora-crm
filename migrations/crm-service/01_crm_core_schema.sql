-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE (crm-db)
-- MOTOR: PostgreSQL 16+
-- ARQUITECTURA: Multi-tenant (RLS), Event-Driven, Microservices
-- INSPIRACIÓN: Salesforce / HubSpot / Monica CRM
-- ==============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- 1. ENTIDADES PRINCIPALES (B2B y B2C)
-- ==============================================================================

-- COMPAÑÍAS (B2B)
CREATE TABLE "companies" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "tax_id" VARCHAR(100), -- NIT, RUT, EIN
    "website" VARCHAR(255),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "country" VARCHAR(100),
    "city" VARCHAR(100),
    "address" TEXT,
    "industry" VARCHAR(100),
    "number_of_employees" INT,
    "annual_revenue" NUMERIC(15,2),
    "description" TEXT,
    "parent_company_id" UUID,
    "linkedin_url" VARCHAR(255),
    "logo_url" TEXT,
    "lifecycle_stage" VARCHAR(50) DEFAULT 'PROSPECT', -- 'LEAD', 'PROSPECT', 'CUSTOMER', 'CHURNED', 'PARTNER'
    "assigned_user_id" UUID,
    "health_score" INT DEFAULT 100,
    "tier" VARCHAR(30) DEFAULT 'TIER_2', -- 'TIER_1_VIP', 'TIER_2', 'TIER_3'
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACTOS (Personas B2C o Empleados de B2B)
CREATE TABLE "contacts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID REFERENCES "companies"("id") ON DELETE SET NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "identification_type" VARCHAR(50), -- Ej: 'CC', 'NIT', 'PASSPORT'
    "identification_number" VARCHAR(100),
    "verification_digit" VARCHAR(5), -- DV para NIT
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "whatsapp_number" VARCHAR(50),
    "linkedin_url" VARCHAR(255),
    "birth_date" DATE,
    
    -- Direcciones (Lugares)
    "street_address" VARCHAR(255),
    "city" VARCHAR(255),
    "state_province" VARCHAR(255),
    "postal_code" VARCHAR(50),
    "country" VARCHAR(100),
    "latitude" NUMERIC(10,8),
    "longitude" NUMERIC(11,8),
    "timezone" VARCHAR(100) DEFAULT 'America/Bogota',
    "preferred_language" VARCHAR(10) DEFAULT 'ES',
    
    -- CRM Personal (Personal CRM Features)
    "nickname" VARCHAR(255),
    "gender" VARCHAR(50),
    "is_starred" BOOLEAN DEFAULT false,
    "is_deceased" BOOLEAN DEFAULT false,
    "stay_in_touch_frequency_days" INT, -- Recordatorios para mantener el contacto
    "last_talked_to_at" TIMESTAMPTZ,
    
    "tax_regime" VARCHAR(100), -- Ej: 'Régimen Común', 'Simplificado'
    "is_tax_liable" BOOLEAN DEFAULT false, -- Responsable de IVA
    "job_title" VARCHAR(100),
    "lead_source" VARCHAR(100), -- Ej: 'Web', 'Referral', 'Social Media'
    "lead_status" VARCHAR(50) DEFAULT 'NEW' CHECK ("lead_status" IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CUSTOMER', 'CHURNED')),
    "lead_score" INT DEFAULT 0,
    "loyalty_points" INT DEFAULT 0,
    "avatar_url" VARCHAR(255),
    "assigned_user_id" UUID,
    "unsubscribed_at" TIMESTAMPTZ,
    "metadata" JSONB DEFAULT '{}'::jsonb, -- Campos personalizados dinámicos
    "custom_fields" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- DIRECCIONES (Polimórfica para Compañías o Contactos)
CREATE TABLE "addresses" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID REFERENCES "contacts"("id") ON DELETE CASCADE,
    "company_id" UUID REFERENCES "companies"("id") ON DELETE CASCADE,
    "address_type" VARCHAR(50) DEFAULT 'BILLING', -- BILLING, SHIPPING, HOME, WORK
    "address_line_1" VARCHAR(255) NOT NULL,
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(50),
    "country" VARCHAR(100),
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. PIPELINE DE VENTAS (Oportunidades / Deals)
-- ==============================================================================

-- PIPELINES (Ej: 'Ventas B2B', 'Renovaciones')
CREATE TABLE "pipelines" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ETAPAS DEL PIPELINE (Ej: 'Prospección', 'Propuesta', 'Negociación')
CREATE TABLE "pipeline_stages" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "pipeline_id" UUID NOT NULL REFERENCES "pipelines"("id") ON DELETE CASCADE,
    "name" VARCHAR(100) NOT NULL,
    "probability_percent" INT DEFAULT 0, -- 0 a 100
    "display_order" INT NOT NULL,
    "is_won_stage" BOOLEAN DEFAULT false,
    "is_lost_stage" BOOLEAN DEFAULT false,
    "auto_actions" JSONB DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- OPORTUNIDADES (Deals)
CREATE TABLE "deals" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "pipeline_id" UUID NOT NULL REFERENCES "pipelines"("id") ON DELETE CASCADE,
    "stage_id" UUID NOT NULL REFERENCES "pipeline_stages"("id") ON DELETE RESTRICT,
    "contact_id" UUID REFERENCES "contacts"("id") ON DELETE SET NULL,
    "company_id" UUID REFERENCES "companies"("id") ON DELETE SET NULL,
    "name" VARCHAR(255) NOT NULL,
    "amount" NUMERIC(15,2) DEFAULT 0.00,
    "currency" VARCHAR(10) DEFAULT 'USD',
    "expected_close_date" DATE,
    "actual_close_date" TIMESTAMPTZ,
    "status" VARCHAR(20) DEFAULT 'OPEN' CHECK ("status" IN ('OPEN', 'WON', 'LOST')),
    "probability_override" INT,
    "forecast_category" VARCHAR(30) DEFAULT 'PIPELINE',
    "assigned_user_id" UUID, -- FK Lógica al identity-service
    "loss_reason" VARCHAR(100),
    "lost_reason_id" UUID,
    "lost_notes" TEXT,
    "territory_id" UUID,
    "price_book_id" UUID,
    "partner_id" UUID,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. INTERACCIONES Y SEGUIMIENTO (El núcleo del CRM)
-- ==============================================================================

-- NOTAS
CREATE TABLE "notes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID REFERENCES "contacts"("id") ON DELETE CASCADE,
    "company_id" UUID REFERENCES "companies"("id") ON DELETE CASCADE,
    "deal_id" UUID REFERENCES "deals"("id") ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN DEFAULT false,
    "is_private" BOOLEAN DEFAULT false,
    "sentiment" VARCHAR(20),
    "author_user_id" UUID NOT NULL, -- FK Lógica
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- TAREAS Y RECORDATORIOS
CREATE TABLE "tasks" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID REFERENCES "contacts"("id") ON DELETE CASCADE,
    "company_id" UUID REFERENCES "companies"("id") ON DELETE CASCADE,
    "deal_id" UUID REFERENCES "deals"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "priority" VARCHAR(20) DEFAULT 'MEDIUM',
    "task_type" VARCHAR(50) DEFAULT 'TODO',
    "due_date" TIMESTAMPTZ NOT NULL,
    "is_completed" BOOLEAN DEFAULT false,
    "completed_at" TIMESTAMPTZ,
    "reminder_at" TIMESTAMPTZ,
    "assigned_user_id" UUID NOT NULL, -- FK Lógica
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- REGISTRO DE LLAMADAS Y REUNIONES
CREATE TABLE "calls" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID REFERENCES "contacts"("id") ON DELETE CASCADE,
    "company_id" UUID REFERENCES "companies"("id") ON DELETE SET NULL,
    "deal_id" UUID REFERENCES "deals"("id") ON DELETE SET NULL,
    "call_type" VARCHAR(50) DEFAULT 'OUTBOUND' CHECK ("call_type" IN ('INBOUND', 'OUTBOUND', 'MEETING')),
    "phone_number" VARCHAR(50),
    "duration_seconds" INT,
    "call_sid" VARCHAR(255),
    "recording_url" TEXT,
    "summary" TEXT,
    "ai_summary" TEXT,
    "sentiment" VARCHAR(30),
    "happened_at" TIMESTAMPTZ NOT NULL,
    "author_user_id" UUID NOT NULL, -- FK Lógica
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. ORGANIZACIÓN Y ETIQUETAS
-- ==============================================================================

CREATE TABLE "tags" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(20) DEFAULT '#E2E8F0',
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "contact_tags" (
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    "tag_id" UUID NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
    "tenant_id" UUID NOT NULL,
    PRIMARY KEY ("contact_id", "tag_id")
);

-- ==============================================================================
-- 5. SOPORTE Y TICKETS
-- ==============================================================================

CREATE TABLE "support_tickets" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID REFERENCES "contacts"("id") ON DELETE CASCADE,
    "company_id" UUID REFERENCES "companies"("id") ON DELETE SET NULL,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(50) DEFAULT 'OPEN' CHECK ("status" IN ('OPEN', 'PENDING', 'RESOLVED', 'CLOSED')),
    "priority" VARCHAR(50) DEFAULT 'MEDIUM',
    "channel" VARCHAR(50) DEFAULT 'PORTAL',
    "assigned_user_id" UUID, -- FK Lógica
    "sla_id" UUID,
    "sla_policy_id" UUID,
    "first_response_at" TIMESTAMPTZ,
    "sla_breach_at" TIMESTAMPTZ,
    "resolved_at" TIMESTAMPTZ,
    "closed_at" TIMESTAMPTZ,
    "is_escalated" TIMESTAMPTZ,
    "escalation_level" INT DEFAULT 1,
    "csat_score" INT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS
-- ==============================================================================
CREATE TRIGGER upd_companies BEFORE UPDATE ON "companies" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_contacts BEFORE UPDATE ON "contacts" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_deals BEFORE UPDATE ON "deals" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_notes BEFORE UPDATE ON "notes" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_tasks BEFORE UPDATE ON "tasks" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_tickets BEFORE UPDATE ON "support_tickets" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO (Paginación y Multi-tenant)
-- ==============================================================================
CREATE INDEX "idx_companies_tenant_created" ON "companies"("tenant_id", "created_at" DESC);
CREATE INDEX "idx_contacts_tenant_created" ON "contacts"("tenant_id", "created_at" DESC);
CREATE INDEX "idx_deals_tenant_stage" ON "deals"("tenant_id", "stage_id");
CREATE INDEX "idx_notes_tenant_contact" ON "notes"("tenant_id", "contact_id", "created_at" DESC);
CREATE INDEX "idx_tasks_tenant_due" ON "tasks"("tenant_id", "assigned_user_id", "due_date");
CREATE INDEX "idx_calls_tenant_contact" ON "calls"("tenant_id", "contact_id", "happened_at" DESC);

-- ==============================================================================
-- SEGURIDAD: ROW-LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pipelines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pipeline_stages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "calls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_tickets" ENABLE ROW LEVEL SECURITY;

-- Política universal para todas las tablas (Aislamiento de Tenant)
DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
