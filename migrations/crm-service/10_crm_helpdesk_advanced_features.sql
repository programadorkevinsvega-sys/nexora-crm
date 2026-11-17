-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE (HELPDESK EXPANSION)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Carpetas, Logs de Envío, Suscripciones y Multi-Emails
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
-- 1. CARPETAS PERSONALIZADAS Y DE SISTEMA (Folders)
-- ==============================================================================
-- Lógica: Permite organizar las conversaciones en carpetas (Inbox, Spam, Custom).

CREATE TABLE "crm_helpdesk_folders" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "mailbox_id" UUID NOT NULL REFERENCES "crm_helpdesk_mailboxes"("id") ON DELETE CASCADE,
    "user_id" UUID, -- Si es null, es una carpeta compartida del buzón. Si tiene UUID, es privada del agente.
    
    "name" VARCHAR(255) NOT NULL,
    "folder_type" VARCHAR(50) DEFAULT 'CUSTOM' CHECK ("folder_type" IN ('INBOX', 'DRAFTS', 'SENT', 'SPAM', 'TRASH', 'CUSTOM')),
    
    "total_count" INT DEFAULT 0,
    "active_count" INT DEFAULT 0,
    "metadata_json" JSONB DEFAULT '{}'::jsonb,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Relación N:M entre Conversaciones y Carpetas
CREATE TABLE "crm_helpdesk_conversation_folders" (
    "folder_id" UUID NOT NULL REFERENCES "crm_helpdesk_folders"("id") ON DELETE CASCADE,
    "conversation_id" UUID NOT NULL REFERENCES "crm_helpdesk_conversations"("id") ON DELETE CASCADE,
    PRIMARY KEY ("folder_id", "conversation_id")
);

-- ==============================================================================
-- 2. MÚLTIPLES CORREOS POR CLIENTE (Customer Emails)
-- ==============================================================================
-- Lógica: Un cliente puede escribir desde diferentes correos, todos se asocian al mismo perfil.

CREATE TABLE "crm_helpdesk_customer_emails" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    
    "email_address" VARCHAR(255) NOT NULL,
    "email_type" VARCHAR(50) DEFAULT 'PRIMARY' CHECK ("email_type" IN ('PRIMARY', 'SECONDARY', 'WORK', 'PERSONAL', 'OTHER')),
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "email_address")
);

-- ==============================================================================
-- 3. LOGS DE ENVÍO DE CORREOS (Send Logs)
-- ==============================================================================
-- Lógica: Trazabilidad exacta de si un correo salió, rebotó o fue entregado.

CREATE TABLE "crm_helpdesk_send_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "thread_id" UUID REFERENCES "crm_helpdesk_threads"("id") ON DELETE SET NULL,
    "customer_id" UUID REFERENCES "contacts"("id") ON DELETE SET NULL,
    "user_id" UUID, -- Agente que envió
    
    "message_id" VARCHAR(255), -- ID del proveedor de correo (Ej: SendGrid, AWS SES)
    "recipient_email" VARCHAR(255) NOT NULL,
    
    "email_type" VARCHAR(50) CHECK ("email_type" IN ('REPLY', 'FORWARD', 'NEW_TICKET', 'NOTIFICATION', 'AUTO_REPLY')),
    "delivery_status" VARCHAR(50) NOT NULL CHECK ("delivery_status" IN ('QUEUED', 'SENT', 'DELIVERED', 'BOUNCED', 'DROPPED', 'DEFERRED')),
    
    "status_message" TEXT, -- Razón del rebote o error
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. SUSCRIPCIONES A EVENTOS (Event Subscriptions)
-- ==============================================================================
-- Lógica: Permite a los agentes suscribirse a notificaciones específicas.

CREATE TABLE "crm_helpdesk_subscriptions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL, -- FK lógica a identity-service
    
    "notification_channel" VARCHAR(50) NOT NULL CHECK ("notification_channel" IN ('EMAIL', 'PUSH', 'SLACK', 'WEBHOOK')),
    "event_type" VARCHAR(100) NOT NULL CHECK ("event_type" IN ('TICKET_CREATED', 'TICKET_ASSIGNED', 'NEW_REPLY', 'SLA_BREACH_WARNING', 'NOTE_ADDED')),
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "user_id", "notification_channel", "event_type")
);

-- ==============================================================================
-- TRIGGERS, ÍNDICES Y RLS
-- ==============================================================================

CREATE TRIGGER upd_crm_helpdesk_folders BEFORE UPDATE ON "crm_helpdesk_folders" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_helpdesk_send_logs BEFORE UPDATE ON "crm_helpdesk_send_logs" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX CONCURRENTLY "idx_hd_folders_mailbox" ON "crm_helpdesk_folders"("mailbox_id");
CREATE INDEX CONCURRENTLY "idx_hd_cust_emails_cust" ON "crm_helpdesk_customer_emails"("customer_id");
CREATE INDEX CONCURRENTLY "idx_hd_send_logs_thread" ON "crm_helpdesk_send_logs"("thread_id");
CREATE INDEX CONCURRENTLY "idx_hd_send_logs_status" ON "crm_helpdesk_send_logs"("delivery_status");
CREATE INDEX CONCURRENTLY "idx_hd_subs_user" ON "crm_helpdesk_subscriptions"("user_id");

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('crm_helpdesk_folders', 'crm_helpdesk_conversation_folders', 'crm_helpdesk_customer_emails', 'crm_helpdesk_send_logs', 'crm_helpdesk_subscriptions') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
