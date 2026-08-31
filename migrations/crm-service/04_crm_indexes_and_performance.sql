-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE (crm-db)
-- OBJETIVO: Optimización de Rendimiento y Cumplimiento de Estándares (Skill: database-production-architect)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. ÍNDICES PARA JOINS Y FOREIGN KEYS (Prevención de Deadlocks)
-- ==============================================================================

-- CORE CRM
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contacts_company_id" ON "contacts"("company_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_addresses_contact_id" ON "addresses"("contact_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_addresses_company_id" ON "addresses"("company_id");

-- PIPELINE Y DEALS
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_pipeline_stages_pipeline_id" ON "pipeline_stages"("pipeline_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deals_pipeline_id" ON "deals"("pipeline_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deals_contact_id" ON "deals"("contact_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deals_company_id" ON "deals"("company_id");

-- INTERACCIONES
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notes_company_id" ON "notes"("company_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notes_deal_id" ON "notes"("deal_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_tasks_contact_id" ON "tasks"("contact_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_tasks_company_id" ON "tasks"("company_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_tasks_deal_id" ON "tasks"("deal_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_calls_contact_id" ON "calls"("contact_id");

-- SOPORTE Y TICKETS
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_support_tickets_contact_id" ON "support_tickets"("contact_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_ticket_replies_ticket_id" ON "ticket_replies"("ticket_id");

-- MÓDULOS AVANZADOS
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_companies_parent_company_id" ON "companies"("parent_company_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contact_relationships_primary" ON "contact_relationships"("primary_contact_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contact_relationships_related" ON "contact_relationships"("related_contact_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_campaign_members_campaign_id" ON "campaign_members"("campaign_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_campaign_members_contact_id" ON "campaign_members"("contact_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deal_line_items_deal_id" ON "deal_line_items"("deal_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_quotes_deal_id" ON "quotes"("deal_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_emails_contact_id" ON "emails"("contact_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_emails_deal_id" ON "emails"("deal_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_whatsapp_messages_contact_id" ON "whatsapp_messages"("contact_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_meetings_contact_id" ON "meetings"("contact_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_meetings_deal_id" ON "meetings"("deal_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contracts_company_id" ON "contracts"("company_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contracts_deal_id" ON "contracts"("deal_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_partners_company_id" ON "partners"("company_id");

-- ==============================================================================
-- 2. RESTRICCIONES DE INTEGRIDAD Y SEGURIDAD (Data Quality)
-- ==============================================================================

-- Probabilidades y descuentos deben ser porcentajes válidos (0 a 100)
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "chk_stages_probability" CHECK ("probability_percent" >= 0 AND "probability_percent" <= 100);
ALTER TABLE "deal_line_items" ADD CONSTRAINT "chk_deal_lines_discount" CHECK ("discount_percent" >= 0 AND "discount_percent" <= 100);

-- Prevenir valores financieros negativos
ALTER TABLE "deals" ADD CONSTRAINT "chk_deals_amount_positive" CHECK ("amount" >= 0);
ALTER TABLE "deal_line_items" ADD CONSTRAINT "chk_deal_lines_price_positive" CHECK ("unit_price" >= 0 AND "total_price" >= 0);
ALTER TABLE "quotes" ADD CONSTRAINT "chk_quotes_totals_positive" CHECK ("subtotal" >= 0 AND "grand_total" >= 0);
ALTER TABLE "contracts" ADD CONSTRAINT "chk_contracts_mrr_positive" CHECK ("mrr_value" >= 0);

-- Validar coherencia de fechas en contratos y campañas
ALTER TABLE "contracts" ADD CONSTRAINT "chk_contracts_dates" CHECK ("end_date" IS NULL OR "end_date" > "start_date");
ALTER TABLE "campaigns" ADD CONSTRAINT "chk_campaigns_dates" CHECK ("end_date" IS NULL OR "end_date" >= "start_date");
ALTER TABLE "meetings" ADD CONSTRAINT "chk_meetings_times" CHECK ("end_time" > "start_time");

COMMIT;
