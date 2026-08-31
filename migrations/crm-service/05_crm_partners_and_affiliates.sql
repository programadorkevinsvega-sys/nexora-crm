-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE (EXPANSION)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Marketing de Afiliados (MLM), Comisiones y Portal de Partners
-- SKILL: database-production-architect (Ultra Enterprise)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 7. PROGRAMAS DE AFILIADOS Y MULTINIVEL (Affiliates & MLM)
-- ==============================================================================

CREATE TABLE "crm_affiliate_programs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "commission_type" VARCHAR(50) NOT NULL CHECK ("commission_type" IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    "commission_value" NUMERIC(10,2) NOT NULL,
    "cookie_duration_days" INT DEFAULT 30,
    "is_multi_level" BOOLEAN DEFAULT false, -- Si es verdadero, habilita el árbol MLM
    "max_mlm_levels" INT DEFAULT 1,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "crm_affiliates" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "program_id" UUID NOT NULL REFERENCES "crm_affiliate_programs"("id") ON DELETE RESTRICT,
    "customer_id" UUID NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE, -- El afiliado es un cliente
    
    "referral_code" VARCHAR(50) NOT NULL UNIQUE,
    "referral_link" TEXT NOT NULL UNIQUE,
    
    -- Para multinivel (MLM)
    "parent_affiliate_id" UUID REFERENCES "crm_affiliates"("id") ON DELETE SET NULL,
    "mlm_level" INT DEFAULT 0,
    
    "status" VARCHAR(50) DEFAULT 'ACTIVE' CHECK ("status" IN ('PENDING', 'ACTIVE', 'SUSPENDED')),
    "total_earnings" NUMERIC(15,2) DEFAULT 0.00,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "program_id", "customer_id")
);

-- Comisiones generadas por ventas referidas
CREATE TABLE "crm_affiliate_commissions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "affiliate_id" UUID NOT NULL REFERENCES "crm_affiliates"("id") ON DELETE CASCADE,
    "source_order_id" UUID NOT NULL, -- FK Lógica al sales-service o ecommerce-service
    
    "commission_amount" NUMERIC(15,2) NOT NULL,
    "mlm_level_earned" INT DEFAULT 0, -- 0 si fue venta directa, 1 si fue de un referido, etc.
    
    "status" VARCHAR(50) DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
    "approved_at" TIMESTAMPTZ,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Pagos consolidados a los afiliados
CREATE TABLE "crm_affiliate_payouts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "affiliate_id" UUID NOT NULL REFERENCES "crm_affiliates"("id") ON DELETE CASCADE,
    
    "amount" NUMERIC(15,2) NOT NULL,
    "payment_method" VARCHAR(100), -- Ej: 'PayPal', 'Bank Transfer'
    "payment_reference" VARCHAR(255),
    
    "status" VARCHAR(50) DEFAULT 'PROCESSING' CHECK ("status" IN ('PROCESSING', 'PAID', 'FAILED')),
    "paid_at" TIMESTAMPTZ,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. PORTAL DE PARTNERS Y DISTRIBUIDORES (B2B Partners)
-- ==============================================================================

CREATE TABLE "crm_partners" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    
    "partner_type" VARCHAR(50) NOT NULL CHECK ("partner_type" IN ('RESELLER', 'IMPLEMENTATION_PARTNER', 'TECHNOLOGY_PARTNER', 'REFERRAL')),
    "partner_tier" VARCHAR(50) DEFAULT 'SILVER' CHECK ("partner_tier" IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
    
    "dedicated_account_manager_id" UUID, -- FK Lógica al hr-service
    
    "status" VARCHAR(50) DEFAULT 'ACTIVE' CHECK ("status" IN ('ONBOARDING', 'ACTIVE', 'INACTIVE')),
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Registro de oportunidades (Deal Registration) para evitar conflictos de canal
CREATE TABLE "crm_partner_deal_registrations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "partner_id" UUID NOT NULL REFERENCES "crm_partners"("id") ON DELETE CASCADE,
    
    "end_customer_name" VARCHAR(255) NOT NULL,
    "end_customer_website" VARCHAR(255),
    "estimated_deal_value" NUMERIC(15,2),
    
    "status" VARCHAR(50) DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'WON', 'LOST')),
    "expiration_date" DATE NOT NULL, -- Los deals registrados expiran si no se cierran rápido
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS, ÍNDICES Y RLS
-- ==============================================================================

CREATE TRIGGER upd_affiliate_programs BEFORE UPDATE ON "crm_affiliate_programs" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_affiliates BEFORE UPDATE ON "crm_affiliates" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_partners BEFORE UPDATE ON "crm_partners" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_deal_regs BEFORE UPDATE ON "crm_partner_deal_registrations" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX CONCURRENTLY "idx_affiliates_parent" ON "crm_affiliates"("parent_affiliate_id");
CREATE INDEX CONCURRENTLY "idx_aff_commissions_aff" ON "crm_affiliate_commissions"("affiliate_id");
CREATE INDEX CONCURRENTLY "idx_deal_regs_partner" ON "crm_partner_deal_registrations"("partner_id");

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('crm_affiliate_programs', 'crm_affiliates', 'crm_affiliate_commissions', 'crm_affiliate_payouts', 'crm_partners', 'crm_partner_deal_registrations') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
