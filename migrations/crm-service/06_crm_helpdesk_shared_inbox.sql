-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE (EXPANSION)
-- MOTOR: PostgreSQL 16+
-- RESPONSABILIDAD: Helpdesk Avanzado y Buzón Compartido (Shared Inbox)
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
-- 1. BUZONES COMPARTIDOS (Mailboxes)
-- ==============================================================================
-- Lógica: Permite gestionar múltiples correos (soporte@, ventas@) centralizados.

CREATE TABLE "crm_helpdesk_mailboxes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL, -- Ej: 'Soporte Técnico', 'Ventas B2B'
    "email_address" VARCHAR(255) NOT NULL,
    
    -- Configuración IMAP/SMTP
    "inbound_host" VARCHAR(255),
    "inbound_port" INT DEFAULT 993,
    "inbound_protocol" VARCHAR(20) DEFAULT 'IMAP',
    "inbound_encryption" VARCHAR(20) DEFAULT 'SSL',
    
    "outbound_host" VARCHAR(255),
    "outbound_port" INT DEFAULT 465,
    "outbound_encryption" VARCHAR(20) DEFAULT 'SSL',
    
    -- Credenciales (Deberían estar encriptadas a nivel de aplicación o Vault)
    "credentials_secret_id" VARCHAR(255), 
    
    "auto_reply_enabled" BOOLEAN DEFAULT false,
    "auto_reply_subject" VARCHAR(255),
    "auto_reply_body" TEXT,
    
    "signature_html" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("tenant_id", "email_address")
);

-- Acceso de agentes a los buzones
CREATE TABLE "crm_helpdesk_mailbox_users" (
    "mailbox_id" UUID NOT NULL REFERENCES "crm_helpdesk_mailboxes"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL, -- FK Lógica a identity-service (agente)
    "role" VARCHAR(50) DEFAULT 'AGENT' CHECK ("role" IN ('ADMIN', 'AGENT', 'VIEWER')),
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY ("mailbox_id", "user_id")
);

-- ==============================================================================
-- 2. CONVERSACIONES (Tickets)
-- ==============================================================================
-- Lógica: Reemplaza/Expande el concepto de ticket simple a una conversación omnicanal.

CREATE TABLE "crm_helpdesk_conversations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "mailbox_id" UUID NOT NULL REFERENCES "crm_helpdesk_mailboxes"("id"),
    
    "ticket_number" SERIAL, -- Número legible para el cliente (Ej: #1024)
    "subject" VARCHAR(255) NOT NULL,
    
    "customer_id" UUID, -- FK Lógica a crm_contacts
    "customer_email" VARCHAR(255) NOT NULL,
    
    "assignee_user_id" UUID, -- FK Lógica a identity-service (Agente asignado)
    
    "status" VARCHAR(50) DEFAULT 'OPEN' CHECK ("status" IN ('OPEN', 'PENDING', 'CLOSED', 'SPAM')),
    "priority" VARCHAR(20) DEFAULT 'NORMAL' CHECK ("priority" IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    
    "source_channel" VARCHAR(50) DEFAULT 'EMAIL' CHECK ("source_channel" IN ('EMAIL', 'WEB_WIDGET', 'API', 'WHATSAPP')),
    
    "preview_text" VARCHAR(255), -- Extracto del último mensaje para la UI
    "has_attachments" BOOLEAN DEFAULT false,
    
    "last_reply_at" TIMESTAMPTZ,
    "last_reply_from" VARCHAR(50) CHECK ("last_reply_from" IN ('CUSTOMER', 'AGENT', 'SYSTEM')),
    "closed_at" TIMESTAMPTZ,
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Seguidores (Agentes que reciben notificaciones de esta conversación)
CREATE TABLE "crm_helpdesk_followers" (
    "conversation_id" UUID NOT NULL REFERENCES "crm_helpdesk_conversations"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL, -- FK Lógica a identity-service
    "added_at" TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY ("conversation_id", "user_id")
);

-- ==============================================================================
-- 3. HILOS DE MENSAJES (Threads)
-- ==============================================================================
-- Lógica: Cada respuesta, nota interna o evento de sistema dentro de la conversación.

CREATE TABLE "crm_helpdesk_threads" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL REFERENCES "crm_helpdesk_conversations"("id") ON DELETE CASCADE,
    
    "thread_type" VARCHAR(50) NOT NULL CHECK ("thread_type" IN ('MESSAGE', 'INTERNAL_NOTE', 'SYSTEM_EVENT')),
    
    "created_by_user_id" UUID, -- Si lo creó un agente
    "created_by_customer_id" UUID, -- Si lo creó el cliente
    
    "body_html" TEXT,
    "body_text" TEXT,
    
    "message_id_header" VARCHAR(255), -- Message-ID del correo original (para threading IMAP)
    "in_reply_to_header" VARCHAR(255),
    
    "to_addresses" TEXT, -- JSON o CSV de destinatarios
    "cc_addresses" TEXT,
    "bcc_addresses" TEXT,
    
    "is_draft" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. ADJUNTOS (Attachments)
-- ==============================================================================

CREATE TABLE "crm_helpdesk_attachments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "thread_id" UUID NOT NULL REFERENCES "crm_helpdesk_threads"("id") ON DELETE CASCADE,
    
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size_bytes" INT NOT NULL,
    "storage_url" TEXT NOT NULL, -- URL en S3 o Media Service
    
    "is_inline" BOOLEAN DEFAULT false, -- Si es una imagen incrustada en el cuerpo del correo
    "content_id" VARCHAR(255), -- CID para imágenes inline
    
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS, ÍNDICES Y RLS
-- ==============================================================================

CREATE TRIGGER upd_crm_helpdesk_mailboxes BEFORE UPDATE ON "crm_helpdesk_mailboxes" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_helpdesk_conversations BEFORE UPDATE ON "crm_helpdesk_conversations" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER upd_crm_helpdesk_threads BEFORE UPDATE ON "crm_helpdesk_threads" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX CONCURRENTLY "idx_hd_conv_mailbox" ON "crm_helpdesk_conversations"("mailbox_id", "status");
CREATE INDEX CONCURRENTLY "idx_hd_conv_customer" ON "crm_helpdesk_conversations"("customer_id");
CREATE INDEX CONCURRENTLY "idx_hd_conv_assignee" ON "crm_helpdesk_conversations"("assignee_user_id", "status");
CREATE INDEX CONCURRENTLY "idx_hd_threads_conv" ON "crm_helpdesk_threads"("conversation_id", "created_at");
CREATE INDEX CONCURRENTLY "idx_hd_threads_msgid" ON "crm_helpdesk_threads"("message_id_header");

DO $$ DECLARE t text; BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('crm_helpdesk_mailboxes', 'crm_helpdesk_mailbox_users', 'crm_helpdesk_conversations', 'crm_helpdesk_followers', 'crm_helpdesk_threads', 'crm_helpdesk_attachments') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);', t);
    END LOOP;
END $$;

COMMIT;
