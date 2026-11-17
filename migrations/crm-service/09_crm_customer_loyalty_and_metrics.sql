-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE (EXPANSION)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Fidelización, Segmentación Dinámica y Métricas Avanzadas
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
-- 1. CLIENTES FRECUENTES Y NIVELES DE LEALTAD (Loyalty & Tiers)
-- ==============================================================================
-- Lógica: Tracking automático del nivel del cliente basado en sus compras.

CREATE TABLE "crm_loyalty_profiles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    
    "loyalty_points_balance" INT DEFAULT 0 CHECK ("loyalty_points_balance" >= 0),
    "tier_level" VARCHAR(50) DEFAULT 'BRONZE' CHECK ("tier_level" IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND')),
    
    "total_lifetime_value" NUMERIC(15,2) DEFAULT 0.00, -- Total gastado históricamente
    "total_purchases_count" INT DEFAULT 0,
    "average_order_value" NUMERIC(15,2) DEFAULT 0.00,
    
    "last_purchase_date" DATE,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("contact_id")
);

-- ==============================================================================
-- 2. SEGMENTACIÓN DINÁMICA (Customer Segments)
-- ==============================================================================
-- Lógica: Agrupación de clientes para marketing (Ej: "VIPs que no compran hace 6 meses").

CREATE TABLE "crm_customer_segments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    
    "is_dynamic" BOOLEAN DEFAULT false, -- Si es dinámico, se recalcula con una query/regla
    "rules_json" JSONB, -- Reglas para la segmentación dinámica (Ej: {"last_purchase_days_ago": ">180"})
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Asignación manual o calculada de clientes a segmentos
CREATE TABLE "crm_segment_assignments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "segment_id" UUID NOT NULL REFERENCES "crm_customer_segments"("id") ON DELETE CASCADE,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    "assigned_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("segment_id", "contact_id")
);

-- ==============================================================================
-- 3. PREFERENCIAS DE PRODUCTO (Product Preferences)
-- ==============================================================================
-- Lógica: Lo que le gusta o no le gusta al cliente (Vital para recomendaciones IA).

CREATE TABLE "crm_product_preferences" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    
    "category_id" UUID, -- FK Lógica a catalog-service (categories)
    "product_id" UUID, -- FK Lógica a catalog-service (products)
    
    "preference_level" VARCHAR(50) NOT NULL CHECK ("preference_level" IN ('FAVORITE', 'LIKES', 'DISLIKES', 'ALLERGIC')),
    "notes" TEXT,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. MÉTRICAS AVANZADAS Y RIESGO DE CHURN (Advanced Metrics & Churn)
-- ==============================================================================
-- Lógica: Snapshot de KPIs calculados por procesos en background o IA.

CREATE TABLE "crm_customer_metrics" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    
    "churn_risk_score" NUMERIC(5,4) CHECK ("churn_risk_score" >= 0 AND "churn_risk_score" <= 1), -- 0.0 a 1.0 (100% riesgo)
    "rfm_score" VARCHAR(10), -- Recency, Frequency, Monetary value score (Ej: '555' es el mejor)
    "nps_score" INT CHECK ("nps_score" >= 0 AND "nps_score" <= 10), -- Net Promoter Score
    "customer_satisfaction_score" NUMERIC(5,2), -- CSAT
    
    "calculated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("contact_id")
);

-- ==============================================================================
-- TRIGGERS, ÍNDICES Y RLS
-- ==============================================================================

CREATE TRIGGER upd_crm_loyalty_profiles BEFORE UPDATE ON "crm_loyalty_profiles" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_customer_segments BEFORE UPDATE ON "crm_customer_segments" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_product_preferences BEFORE UPDATE ON "crm_product_preferences" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX CONCURRENTLY "idx_crm_loyalty_tier" ON "crm_loyalty_profiles"("tier_level");
CREATE INDEX CONCURRENTLY "idx_crm_segments_tenant" ON "crm_customer_segments"("tenant_id");
CREATE INDEX CONCURRENTLY "idx_crm_preferences_contact" ON "crm_product_preferences"("contact_id", "preference_level");
CREATE INDEX CONCURRENTLY "idx_crm_metrics_churn" ON "crm_customer_metrics"("churn_risk_score");

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('crm_loyalty_profiles', 'crm_customer_segments', 'crm_segment_assignments', 'crm_product_preferences', 'crm_customer_metrics') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
