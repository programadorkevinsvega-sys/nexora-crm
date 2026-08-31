-- RLS (Row Level Security) Policies
-- Aplica aislamiento multi-tenant via tenant_id = current_setting('app.current_tenant_id')
-- La app debe ejecutar: SELECT set_config('app.current_tenant_id', $tenantId, true)
-- antes de cada operación (NestJS interceptor o middleware)

-- ============================================================
-- SCHEMA: auth
-- ============================================================

ALTER TABLE auth.mfa_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON auth.mfa_methods
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON auth.sessions
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE auth.ip_restrictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON auth.ip_restrictions
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE auth.oauth_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON auth.oauth_providers
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE auth.password_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON auth.password_policies
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- No RLS: mfa_recovery_codes (no tenant_id), password_history (no tenant_id)
-- No RLS: outbox_events, event_dead_letters (infrastructure tables)
-- inbox_events has nullable tenant_id, but is accessed by service logic, not direct user queries

-- ============================================================
-- SCHEMA: users
-- ============================================================

ALTER TABLE users.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON users.users
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE users.natural_person_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON users.natural_person_profiles
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE users.legal_entity_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON users.legal_entity_profiles
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE users.user_mobile_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON users.user_mobile_devices
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- No RLS: user_oauth_links (no tenant_id)

-- ============================================================
-- SCHEMA: iam
-- ============================================================

ALTER TABLE iam.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON iam.roles
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE iam.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON iam.user_roles
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- No RLS: permissions (system-wide), role_permissions (junction, no tenant_id)

-- ============================================================
-- SCHEMA: tenants
-- ============================================================

ALTER TABLE tenants.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenants
  USING (id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.branches
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_branding ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_branding
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_saas_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_saas_snapshot
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_features
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_usage_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_usage_metrics
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_domains
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_languages
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_translations
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_currencies
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_exchange_rates
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_api_keys
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_webhooks
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_webhook_delivery_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_webhook_delivery_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_system_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_system_audit_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.installed_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.installed_modules
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenants.tenant_tax_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants.tenant_tax_configurations
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- No RLS: system_modules (system-wide), global_system_parameters (system-wide)
-- No RLS: tenant_webhook_events (junction, no tenant_id)

-- ============================================================
-- SCHEMA: notifications
-- ============================================================

ALTER TABLE notifications.notification_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notifications.notification_channels
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE notifications.notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notifications.notification_templates
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE notifications.notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notifications.notification_queue
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE notifications.notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notifications.notification_logs
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE notifications.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notifications.notification_preferences
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- SCHEMA: audit
-- ============================================================

ALTER TABLE audit.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit.audit_logs
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- SCHEMA: storage
-- ============================================================

ALTER TABLE storage.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON storage.files
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- SCHEMA: scheduler
-- ============================================================

ALTER TABLE scheduler.scheduled_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON scheduler.scheduled_tasks
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE scheduler.task_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON scheduler.task_executions
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE scheduler.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON scheduler.reminders
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE scheduler.sla_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON scheduler.sla_configs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE scheduler.sla_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON scheduler.sla_violations
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- SCHEMA: public (CRM)
-- ============================================================
-- Core CRM tables
-- ============================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON companies
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON contacts
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON addresses
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON pipelines
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON pipeline_stages
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON deals
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notes
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tasks
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON calls
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON support_tickets
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tags
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON contact_tags
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- SCHEMA: public (CRM) — Advanced
-- ============================================================

ALTER TABLE contact_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON contact_relationships
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON campaigns
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON campaign_members
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE deal_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON deal_line_items
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON quotes
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON emails
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON whatsapp_messages
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON meetings
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE document_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON document_links
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ticket_replies
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE field_history_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON field_history_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- SCHEMA: public (CRM) — Enterprise
-- ============================================================

ALTER TABLE sales_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON sales_teams
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE sales_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON sales_team_members
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE sales_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON sales_quotas
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE lost_reasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON lost_reasons
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON competitors
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE deal_competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON deal_competitors
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON contracts
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE slas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON slas
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON partners
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- SCHEMA: public (CRM) — Affiliates
-- ============================================================

ALTER TABLE crm_affiliate_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_affiliate_programs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_affiliates
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_affiliate_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_affiliate_commissions
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_affiliate_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_affiliate_payouts
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_partners
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_partner_deal_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_partner_deal_registrations
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- SCHEMA: public (CRM) — Helpdesk Inbox
-- ============================================================

ALTER TABLE crm_helpdesk_mailboxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_mailboxes
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_helpdesk_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_conversations
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_helpdesk_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_threads
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_helpdesk_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_attachments
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- No RLS: crm_helpdesk_mailbox_users, crm_helpdesk_followers (junction, no tenant_id)

-- ============================================================
-- SCHEMA: public (CRM) — Personal CRM
-- ============================================================

ALTER TABLE crm_relationship_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_relationship_types
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_contact_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_contact_relationships
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_life_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_life_events
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_contact_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_contact_gifts
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_contact_debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_contact_debts
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_contact_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_contact_reminders
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- SCHEMA: public (CRM) — Activities
-- ============================================================

ALTER TABLE crm_contact_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_contact_notes
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_activities
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_activity_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_activity_contacts
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_call_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_contact_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_contact_tasks
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_contact_pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_contact_pets
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- SCHEMA: public (CRM) — Loyalty
-- ============================================================

ALTER TABLE crm_loyalty_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_loyalty_profiles
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_customer_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_customer_segments
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_segment_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_segment_assignments
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_product_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_product_preferences
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_customer_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_customer_metrics
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- SCHEMA: public (CRM) — Helpdesk Advanced
-- ============================================================

ALTER TABLE crm_helpdesk_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_folders
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_helpdesk_customer_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_customer_emails
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_helpdesk_send_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_send_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_helpdesk_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_subscriptions
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- No RLS: crm_helpdesk_conversation_folders (junction, no tenant_id)

-- ============================================================
-- SCHEMA: public (CRM) — Helpdesk ITSM
-- ============================================================

ALTER TABLE crm_helpdesk_ticket_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_ticket_statuses
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_helpdesk_ticket_priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_ticket_priorities
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_helpdesk_ticket_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_ticket_categories
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_helpdesk_agent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_agent_profiles
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE crm_helpdesk_ticket_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON crm_helpdesk_ticket_audits
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================
-- NOTA: excluidas de RLS (sin tenant_id o infraestructura):
--   public.outbox_events (global)
--   *.outbox_events, *.event_dead_letters (infraestructura interna por servicio)
--   *.inbox_events (infraestructura, tenant_id nullable)
--   auth.mfa_recovery_codes, auth.password_history
--   users.user_oauth_links
--   iam.permissions (system-wide), iam.role_permissions (junction)
--   tenants.system_modules (system-wide), tenants.global_system_parameters (system-wide)
--   tenants.tenant_webhook_events (junction)
--   public.crm_helpdesk_mailbox_users (junction)
--   public.crm_helpdesk_followers (junction)
--   public.crm_helpdesk_conversation_folders (junction)
-- ============================================================
