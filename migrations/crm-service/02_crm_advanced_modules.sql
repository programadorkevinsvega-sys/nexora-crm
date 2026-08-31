-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE (crm-db) - MÓDULOS AVANZADOS ENTERPRISE
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. RELACIONES COMPLEJAS Y JERARQUÍAS
-- ==============================================================================

-- Jerarquía de Empresas (Parent/Child - Ej: Alphabet -> Google)
ALTER TABLE "companies" ADD COLUMN "parent_company_id" UUID REFERENCES "companies"("id") ON DELETE SET NULL;

-- Relaciones entre Contactos (Ej: "Asistente de", "Referido por")
CREATE TABLE "contact_relationships" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "primary_contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    "related_contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    "relationship_type" VARCHAR(100) NOT NULL, -- Ej: 'MANAGER', 'COLLEAGUE', 'SPOUSE', 'REFERRAL'
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. MARKETING Y CAMPAÑAS
-- ==============================================================================

CREATE TABLE "campaigns" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100), -- EMAIL, WEBINAR, TRADESHOW, SOCIAL
    "status" VARCHAR(50) DEFAULT 'PLANNED' CHECK ("status" IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    "start_date" DATE,
    "end_date" DATE,
    "budgeted_cost" NUMERIC(15,2) DEFAULT 0.00,
    "actual_cost" NUMERIC(15,2) DEFAULT 0.00,
    "expected_revenue" NUMERIC(15,2) DEFAULT 0.00,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "campaign_members" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
    "contact_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    "status" VARCHAR(50) DEFAULT 'SENT' CHECK ("status" IN ('SENT', 'OPENED', 'CLICKED', 'RESPONDED', 'BOUNCED', 'UNSUBSCRIBED')),
    "responded_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. CPQ (COTIZACIONES Y LÍNEAS DE PRODUCTOS EN DEALS)
-- ==============================================================================

-- Productos asociados a una oportunidad (El catálogo real vive en catalog-service)
CREATE TABLE "deal_line_items" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "deal_id" UUID NOT NULL REFERENCES "deals"("id") ON DELETE CASCADE,
    "product_id" UUID NOT NULL, -- FK Lógica al catalog-service
    "product_name" VARCHAR(255) NOT NULL, -- Snapshot del nombre
    "quantity" NUMERIC(10,2) NOT NULL DEFAULT 1,
    "unit_price" NUMERIC(15,2) NOT NULL,
    "discount_percent" NUMERIC(5,2) DEFAULT 0.00,
    "total_price" NUMERIC(15,2) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Cotizaciones formales enviadas al cliente
CREATE TABLE "quotes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "deal_id" UUID NOT NULL REFERENCES "deals"("id") ON DELETE CASCADE,
    "quote_number" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'DRAFT' CHECK ("status" IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    "valid_until" DATE NOT NULL,
    "terms_and_conditions" TEXT,
    "subtotal" NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    "tax_total" NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    "grand_total" NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. OMNICANALIDAD (EMAILS, WHATSAPP, REUNIONES)
-- ==============================================================================

CREATE TABLE "emails" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID REFERENCES "contacts"("id") ON DELETE CASCADE,
    "deal_id" UUID REFERENCES "deals"("id") ON DELETE CASCADE,
    "direction" VARCHAR(20) CHECK ("direction" IN ('INBOUND', 'OUTBOUND')),
    "from_address" VARCHAR(255) NOT NULL,
    "to_address" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500),
    "body_text" TEXT,
    "body_html" TEXT,
    "message_id" VARCHAR(255), -- ID real del proveedor (Gmail, Outlook)
    "status" VARCHAR(50) DEFAULT 'SENT',
    "sent_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "whatsapp_messages" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID REFERENCES "contacts"("id") ON DELETE CASCADE,
    "direction" VARCHAR(20) CHECK ("direction" IN ('INBOUND', 'OUTBOUND')),
    "phone_number" VARCHAR(50) NOT NULL,
    "message_body" TEXT NOT NULL,
    "template_used" VARCHAR(100),
    "status" VARCHAR(50) DEFAULT 'DELIVERED' CHECK ("status" IN ('SENT', 'DELIVERED', 'READ', 'FAILED')),
    "sent_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "meetings" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID REFERENCES "contacts"("id") ON DELETE CASCADE,
    "deal_id" UUID REFERENCES "deals"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255), -- URL de Zoom/Meet o dirección física
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "status" VARCHAR(50) DEFAULT 'SCHEDULED' CHECK ("status" IN ('SCHEDULED', 'HELD', 'CANCELED', 'NO_SHOW')),
    "organizer_user_id" UUID NOT NULL, -- FK Lógica
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. GESTIÓN DOCUMENTAL (ARCHIVOS ADJUNTOS)
-- ==============================================================================


-- Tabla polimórfica para enlazar documentos (alojados en media-service) a cualquier entidad del CRM
CREATE TABLE "document_links" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "media_id" UUID NOT NULL, -- FK Lógica al media-service (donde vive el archivo real)
    "linked_entity_type" VARCHAR(50) NOT NULL, -- 'CONTACT', 'COMPANY', 'DEAL', 'TICKET', 'QUOTE'
    "linked_entity_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX "idx_doc_links_entity" ON "document_links"("tenant_id", "linked_entity_type", "linked_entity_id");

-- ==============================================================================
-- 6. SOPORTE AVANZADO (RESPUESTAS Y SLAs)
-- ==============================================================================

CREATE TABLE "ticket_replies" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL REFERENCES "support_tickets"("id") ON DELETE CASCADE,
    "author_type" VARCHAR(50) NOT NULL CHECK ("author_type" IN ('CUSTOMER', 'AGENT', 'SYSTEM')),
    "author_id" UUID NOT NULL, -- FK Lógica (Contact ID o User ID)
    "message" TEXT NOT NULL,
    "is_internal_note" BOOLEAN DEFAULT false, -- Notas privadas solo para agentes
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. AUDITORÍA (FIELD HISTORY TRACKING)
-- ==============================================================================

CREATE TABLE "field_history_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL, -- 'CONTACT', 'DEAL', 'COMPANY'
    "entity_id" UUID NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by_user_id" UUID NOT NULL, -- FK Lógica
    "changed_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS Y RLS
-- ==============================================================================
CREATE TRIGGER upd_campaigns BEFORE UPDATE ON "campaigns" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_quotes BEFORE UPDATE ON "quotes" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Habilitar RLS en todas las nuevas tablas
DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        AND table_name IN ('contact_relationships', 'campaigns', 'campaign_members', 'deal_line_items', 'quotes', 'emails', 'whatsapp_messages', 'meetings', 'documents', 'document_links', 'ticket_replies', 'field_history_logs')
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
