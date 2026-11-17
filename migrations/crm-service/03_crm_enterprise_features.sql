-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE (crm-db) - CARACTERÍSTICAS ENTERPRISE (Estilo Odoo/Salesforce)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. EQUIPOS DE VENTAS Y METAS (Sales Teams & Quotas)
-- ==============================================================================

CREATE TABLE "sales_teams" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "manager_user_id" UUID, -- FK Lógica al identity-service
    "monthly_target" NUMERIC(15,2) DEFAULT 0.00,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "sales_team_members" (
    "team_id" UUID NOT NULL REFERENCES "sales_teams"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL, -- FK Lógica al identity-service
    "tenant_id" UUID NOT NULL,
    PRIMARY KEY ("team_id", "user_id")
);

-- Cuotas individuales por vendedor por mes
CREATE TABLE "sales_quotas" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL, -- FK Lógica
    "team_id" UUID REFERENCES "sales_teams"("id") ON DELETE CASCADE,
    "period_month" INT NOT NULL CHECK ("period_month" BETWEEN 1 AND 12),
    "period_year" INT NOT NULL,
    "target_amount" NUMERIC(15,2) NOT NULL,
    "achieved_amount" NUMERIC(15,2) DEFAULT 0.00, -- Se actualiza vía eventos cuando se ganan Deals
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("user_id", "period_month", "period_year")
);

-- ==============================================================================
-- 2. INTELIGENCIA DE NEGOCIOS (Competidores y Motivos de Pérdida)
-- ==============================================================================

CREATE TABLE "lost_reasons" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Actualizamos los Deals para soportar el motivo de pérdida
ALTER TABLE "deals" ADD COLUMN "lost_reason_id" UUID REFERENCES "lost_reasons"("id") ON DELETE SET NULL;
ALTER TABLE "deals" ADD COLUMN "lost_notes" TEXT;

CREATE TABLE "competitors" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "website" VARCHAR(255),
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Competidores que están peleando por el mismo Deal
CREATE TABLE "deal_competitors" (
    "deal_id" UUID NOT NULL REFERENCES "deals"("id") ON DELETE CASCADE,
    "competitor_id" UUID NOT NULL REFERENCES "competitors"("id") ON DELETE CASCADE,
    "tenant_id" UUID NOT NULL,
    "is_winner" BOOLEAN DEFAULT false, -- Si perdimos el deal, ¿se lo llevó este competidor?
    PRIMARY KEY ("deal_id", "competitor_id")
);

-- ==============================================================================
-- 3. CONTRATOS Y RENOVACIONES (Suscripciones B2B)
-- ==============================================================================
-- Nota: La facturación mensual la hace el `billing-service`. El CRM maneja el
-- ACUERDO COMERCIAL y avisa al vendedor 30 días antes de que expire para renovarlo.

CREATE TABLE "contracts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "deal_id" UUID REFERENCES "deals"("id") ON DELETE SET NULL, -- El deal que originó el contrato
    "name" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "auto_renew" BOOLEAN DEFAULT false,
    "mrr_value" NUMERIC(15,2) DEFAULT 0.00, -- Monthly Recurring Revenue
    "status" VARCHAR(50) DEFAULT 'ACTIVE' CHECK ("status" IN ('DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'RENEWED')),
    "owner_user_id" UUID NOT NULL, -- Vendedor a cargo de la cuenta
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. SERVICE LEVEL AGREEMENTS (SLAs) PARA SOPORTE TÉCNICO
-- ==============================================================================

CREATE TABLE "slas" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "target_response_minutes" INT NOT NULL,
    "target_resolution_minutes" INT NOT NULL,
    "business_hours_only" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Actualizamos los tickets para soportar SLAs y escalamientos
ALTER TABLE "support_tickets" ADD COLUMN "sla_id" UUID REFERENCES "slas"("id") ON DELETE SET NULL;
ALTER TABLE "support_tickets" ADD COLUMN "first_response_at" TIMESTAMPTZ;
ALTER TABLE "support_tickets" ADD COLUMN "sla_breach_at" TIMESTAMPTZ; -- Cuándo se vence el tiempo límite
ALTER TABLE "support_tickets" ADD COLUMN "is_escalated" BOOLEAN DEFAULT false;

-- ==============================================================================
-- 5. CANALES DE VENTA Y PARTNERS (Resellers)
-- ==============================================================================

CREATE TABLE "partners" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE, -- El partner es también una empresa
    "partner_level" VARCHAR(50), -- Ej: 'SILVER', 'GOLD', 'PLATINUM'
    "commission_percent" NUMERIC(5,2) DEFAULT 0.00,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Si un Deal fue traído por un Partner
ALTER TABLE "deals" ADD COLUMN "partner_id" UUID REFERENCES "partners"("id") ON DELETE SET NULL;

-- ==============================================================================
-- TRIGGERS Y RLS
-- ==============================================================================
CREATE TRIGGER upd_sales_teams BEFORE UPDATE ON "sales_teams" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_contracts BEFORE UPDATE ON "contracts" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        AND table_name IN ('sales_teams', 'sales_team_members', 'sales_quotas', 'lost_reasons', 'competitors', 'deal_competitors', 'contracts', 'slas', 'partners')
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
