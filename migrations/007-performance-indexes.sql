-- ==============================================================================
-- MICROSERVICIO: CRM SERVICE - Performance Indexes (Fase 1.3: Performance)
-- OBJETIVO: Añadir (tenant_id), (tenant_id, created_at) keyset, y FK indexes
--           faltantes en todas las tablas de todos los schemas.
--
-- NOTA: Sin CONCURRENTLY porque se ejecuta dentro de BEGIN/COMMIT.
--       Para producción con alta concurrencia, ejecutar cada CREATE INDEX
--       por separado con CONCURRENTLY fuera de transacción.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- SCHEMA: public (CRM Core - 001-core)
-- ==============================================================================

-- companies
CREATE INDEX IF NOT EXISTS "idx_companies_tenant_id" ON "companies"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_companies_tenant_created_keyset" ON "companies"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_companies_industry" ON "companies"("industry") WHERE "industry" IS NOT NULL;

-- contacts
CREATE INDEX IF NOT EXISTS "idx_contacts_tenant_id" ON "contacts"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_contacts_tenant_created_keyset" ON "contacts"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_contacts_email" ON "contacts"("email") WHERE "email" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_contacts_tenant_name" ON "contacts"("tenant_id", "last_name", "first_name");
CREATE INDEX IF NOT EXISTS "idx_contacts_lead_status" ON "contacts"("tenant_id", "lead_status");
CREATE INDEX IF NOT EXISTS "idx_contacts_is_starred" ON "contacts"("tenant_id", "is_starred") WHERE "is_starred" = true;

-- addresses
CREATE INDEX IF NOT EXISTS "idx_addresses_tenant_id" ON "addresses"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_addresses_tenant_created" ON "addresses"("tenant_id", "created_at" DESC);

-- pipelines
CREATE INDEX IF NOT EXISTS "idx_pipelines_tenant_id" ON "pipelines"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_pipelines_tenant_created" ON "pipelines"("tenant_id", "created_at" DESC);

-- pipeline_stages
CREATE INDEX IF NOT EXISTS "idx_pipeline_stages_tenant_id" ON "pipeline_stages"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_pipeline_stages_order" ON "pipeline_stages"("pipeline_id", "display_order");

-- deals (FK: stage_id, assigned_user_id, lost_reason_id, partner_id)
CREATE INDEX IF NOT EXISTS "idx_deals_tenant_id" ON "deals"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_deals_tenant_created_keyset" ON "deals"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_deals_stage_id" ON "deals"("stage_id");
CREATE INDEX IF NOT EXISTS "idx_deals_assigned_user_id" ON "deals"("assigned_user_id") WHERE "assigned_user_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_deals_lost_reason_id" ON "deals"("lost_reason_id") WHERE "lost_reason_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_deals_partner_id" ON "deals"("partner_id") WHERE "partner_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_deals_status" ON "deals"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_deals_pipeline_stage" ON "deals"("pipeline_id", "stage_id");

-- notes
CREATE INDEX IF NOT EXISTS "idx_notes_tenant_id" ON "notes"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_notes_tenant_created_keyset" ON "notes"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_notes_contact_id" ON "notes"("contact_id") WHERE "contact_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_notes_author_user_id" ON "notes"("author_user_id");

-- tasks
CREATE INDEX IF NOT EXISTS "idx_tasks_tenant_id" ON "tasks"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_tasks_tenant_created_keyset" ON "tasks"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_tasks_assigned_user_id" ON "tasks"("assigned_user_id");
CREATE INDEX IF NOT EXISTS "idx_tasks_is_completed" ON "tasks"("tenant_id", "is_completed");
CREATE INDEX IF NOT EXISTS "idx_tasks_due_date" ON "tasks"("tenant_id", "due_date") WHERE "due_date" IS NOT NULL;

-- calls
CREATE INDEX IF NOT EXISTS "idx_calls_tenant_id" ON "calls"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_calls_tenant_created_keyset" ON "calls"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_calls_author_user_id" ON "calls"("author_user_id");

-- tags
CREATE INDEX IF NOT EXISTS "idx_tags_tenant_id" ON "tags"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_tags_tenant_created_keyset" ON "tags"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_tags_tenant_name" ON "tags"("tenant_id", "name");

-- contact_tags
CREATE INDEX IF NOT EXISTS "idx_contact_tags_contact_id" ON "contact_tags"("contact_id");
CREATE INDEX IF NOT EXISTS "idx_contact_tags_tag_id" ON "contact_tags"("tag_id");
CREATE INDEX IF NOT EXISTS "idx_contact_tags_tenant_id" ON "contact_tags"("tenant_id");

-- support_tickets
CREATE INDEX IF NOT EXISTS "idx_support_tickets_tenant_id" ON "support_tickets"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_support_tickets_tenant_created_keyset" ON "support_tickets"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_support_tickets_assigned_user_id" ON "support_tickets"("assigned_user_id") WHERE "assigned_user_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_support_tickets_sla_id" ON "support_tickets"("sla_id") WHERE "sla_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_support_tickets_status" ON "support_tickets"("tenant_id", "status");

-- ==============================================================================
-- SCHEMA: public (CRM Advanced - 002-advanced)
-- ==============================================================================

-- contact_relationships (002-advanced)
CREATE INDEX IF NOT EXISTS "idx_adv_contact_relationships_tenant" ON "contact_relationships"("tenant_id");

-- campaigns
CREATE INDEX IF NOT EXISTS "idx_campaigns_tenant_id" ON "campaigns"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_campaigns_tenant_created_keyset" ON "campaigns"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_campaigns_status" ON "campaigns"("tenant_id", "status");

-- campaign_members
CREATE INDEX IF NOT EXISTS "idx_campaign_members_tenant_id" ON "campaign_members"("tenant_id");

-- deal_line_items
CREATE INDEX IF NOT EXISTS "idx_deal_line_items_tenant_id" ON "deal_line_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_deal_line_items_product_id" ON "deal_line_items"("product_id");

-- quotes
CREATE INDEX IF NOT EXISTS "idx_quotes_tenant_id" ON "quotes"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_quotes_tenant_created_keyset" ON "quotes"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_quotes_status" ON "quotes"("tenant_id", "status");

-- emails
CREATE INDEX IF NOT EXISTS "idx_emails_tenant_id" ON "emails"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_emails_tenant_created" ON "emails"("tenant_id", "sent_at" DESC);

-- whatsapp_messages
CREATE INDEX IF NOT EXISTS "idx_whatsapp_messages_tenant_id" ON "whatsapp_messages"("tenant_id");

-- meetings
CREATE INDEX IF NOT EXISTS "idx_meetings_tenant_id" ON "meetings"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_meetings_organizer_user_id" ON "meetings"("organizer_user_id");
CREATE INDEX IF NOT EXISTS "idx_meetings_status" ON "meetings"("tenant_id", "status");

-- document_links
CREATE INDEX IF NOT EXISTS "idx_document_links_tenant_id" ON "document_links"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_document_links_media_id" ON "document_links"("media_id");
CREATE INDEX IF NOT EXISTS "idx_document_links_entity" ON "document_links"("linked_entity_type", "linked_entity_id");

-- ticket_replies
CREATE INDEX IF NOT EXISTS "idx_ticket_replies_tenant_id" ON "ticket_replies"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_ticket_replies_tenant_created_keyset" ON "ticket_replies"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_ticket_replies_author_id" ON "ticket_replies"("author_id");

-- field_history_logs
CREATE INDEX IF NOT EXISTS "idx_field_history_logs_tenant_id" ON "field_history_logs"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_field_history_logs_entity" ON "field_history_logs"("entity_type", "entity_id", "changed_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_field_history_logs_changed_by" ON "field_history_logs"("changed_by_user_id");

-- ==============================================================================
-- SCHEMA: public (CRM Enterprise - 003-enterprise)
-- ==============================================================================

-- sales_teams
CREATE INDEX IF NOT EXISTS "idx_sales_teams_tenant_id" ON "sales_teams"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_sales_teams_tenant_created_keyset" ON "sales_teams"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_sales_teams_manager_id" ON "sales_teams"("manager_user_id") WHERE "manager_user_id" IS NOT NULL;

-- sales_team_members
CREATE INDEX IF NOT EXISTS "idx_sales_team_members_team_id" ON "sales_team_members"("team_id");
CREATE INDEX IF NOT EXISTS "idx_sales_team_members_user_id" ON "sales_team_members"("userId");
CREATE INDEX IF NOT EXISTS "idx_sales_team_members_tenant_id" ON "sales_team_members"("tenant_id");

-- sales_quotas
CREATE INDEX IF NOT EXISTS "idx_sales_quotas_tenant_id" ON "sales_quotas"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_sales_quotas_tenant_created_keyset" ON "sales_quotas"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_sales_quotas_user_id" ON "sales_quotas"("user_id");
CREATE INDEX IF NOT EXISTS "idx_sales_quotas_team_id" ON "sales_quotas"("team_id") WHERE "team_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_sales_quotas_period" ON "sales_quotas"("tenant_id", "period_year", "period_month");

-- lost_reasons
CREATE INDEX IF NOT EXISTS "idx_lost_reasons_tenant_id" ON "lost_reasons"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_lost_reasons_tenant_name" ON "lost_reasons"("tenant_id", "name");

-- competitors
CREATE INDEX IF NOT EXISTS "idx_competitors_tenant_id" ON "competitors"("tenant_id");

-- deal_competitors
CREATE INDEX IF NOT EXISTS "idx_deal_competitors_deal_id" ON "deal_competitors"("deal_id");
CREATE INDEX IF NOT EXISTS "idx_deal_competitors_competitor_id" ON "deal_competitors"("competitor_id");
CREATE INDEX IF NOT EXISTS "idx_deal_competitors_tenant_id" ON "deal_competitors"("tenant_id");

-- contracts
CREATE INDEX IF NOT EXISTS "idx_contracts_tenant_id" ON "contracts"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_contracts_tenant_created_keyset" ON "contracts"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_contracts_owner_user_id" ON "contracts"("owner_user_id");
CREATE INDEX IF NOT EXISTS "idx_contracts_status" ON "contracts"("tenant_id", "status");

-- slas
CREATE INDEX IF NOT EXISTS "idx_slas_tenant_id" ON "slas"("tenant_id");

-- partners
CREATE INDEX IF NOT EXISTS "idx_partners_tenant_id" ON "partners"("tenant_id");

-- ==============================================================================
-- SCHEMA: public (Affiliates - 005-affiliates)
-- ==============================================================================

-- crm_affiliate_programs
CREATE INDEX IF NOT EXISTS "idx_aff_programs_tenant_id" ON "crm_affiliate_programs"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_aff_programs_tenant_created" ON "crm_affiliate_programs"("tenant_id", "created_at" DESC);

-- crm_affiliates
CREATE INDEX IF NOT EXISTS "idx_aff_affiliates_tenant_id" ON "crm_affiliates"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_aff_affiliates_tenant_created" ON "crm_affiliates"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_aff_affiliates_program_id" ON "crm_affiliates"("program_id");
CREATE INDEX IF NOT EXISTS "idx_aff_affiliates_customer_id" ON "crm_affiliates"("customer_id");
CREATE INDEX IF NOT EXISTS "idx_aff_affiliates_parent_id" ON "crm_affiliates"("parent_affiliate_id") WHERE "parent_affiliate_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_aff_affiliates_status" ON "crm_affiliates"("tenant_id", "status");

-- crm_affiliate_commissions
CREATE INDEX IF NOT EXISTS "idx_aff_commissions_tenant_id" ON "crm_affiliate_commissions"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_aff_commissions_tenant_created" ON "crm_affiliate_commissions"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_aff_commissions_affiliate_id" ON "crm_affiliate_commissions"("affiliate_id");
CREATE INDEX IF NOT EXISTS "idx_aff_commissions_source_order_id" ON "crm_affiliate_commissions"("source_order_id");
CREATE INDEX IF NOT EXISTS "idx_aff_commissions_status" ON "crm_affiliate_commissions"("tenant_id", "status");

-- crm_affiliate_payouts
CREATE INDEX IF NOT EXISTS "idx_aff_payouts_tenant_id" ON "crm_affiliate_payouts"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_aff_payouts_tenant_created" ON "crm_affiliate_payouts"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_aff_payouts_affiliate_id" ON "crm_affiliate_payouts"("affiliate_id");

-- crm_partners
CREATE INDEX IF NOT EXISTS "idx_crm_partners_tenant_id" ON "crm_partners"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_crm_partners_company_id" ON "crm_partners"("company_id");
CREATE INDEX IF NOT EXISTS "idx_crm_partners_manager_id" ON "crm_partners"("dedicated_account_manager_id") WHERE "dedicated_account_manager_id" IS NOT NULL;

-- crm_partner_deal_registrations
CREATE INDEX IF NOT EXISTS "idx_partner_deal_reg_tenant_id" ON "crm_partner_deal_registrations"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_partner_deal_reg_partner_id" ON "crm_partner_deal_registrations"("partner_id");
CREATE INDEX IF NOT EXISTS "idx_partner_deal_reg_status" ON "crm_partner_deal_registrations"("tenant_id", "status");

-- ==============================================================================
-- SCHEMA: public (Helpdesk Inbox - 006-helpdesk-inbox)
-- ==============================================================================

-- crm_helpdesk_mailboxes
CREATE INDEX IF NOT EXISTS "idx_hd_mailboxes_tenant_id" ON "crm_helpdesk_mailboxes"("tenant_id");

-- crm_helpdesk_mailbox_users
CREATE INDEX IF NOT EXISTS "idx_hd_mailbox_users_mailbox_id" ON "crm_helpdesk_mailbox_users"("mailbox_id");
CREATE INDEX IF NOT EXISTS "idx_hd_mailbox_users_user_id" ON "crm_helpdesk_mailbox_users"("userId");

-- crm_helpdesk_conversations
CREATE INDEX IF NOT EXISTS "idx_hd_conversations_tenant_id" ON "crm_helpdesk_conversations"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_hd_conversations_tenant_created" ON "crm_helpdesk_conversations"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_hd_conversations_mailbox_id" ON "crm_helpdesk_conversations"("mailbox_id");
CREATE INDEX IF NOT EXISTS "idx_hd_conversations_customer_id" ON "crm_helpdesk_conversations"("customer_id") WHERE "customer_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_hd_conversations_assignee" ON "crm_helpdesk_conversations"("assignee_user_id") WHERE "assignee_user_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_hd_conversations_status" ON "crm_helpdesk_conversations"("tenant_id", "status");

-- crm_helpdesk_followers
CREATE INDEX IF NOT EXISTS "idx_hd_followers_conv_id" ON "crm_helpdesk_followers"("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_hd_followers_user_id" ON "crm_helpdesk_followers"("userId");

-- crm_helpdesk_threads
CREATE INDEX IF NOT EXISTS "idx_hd_threads_tenant_id" ON "crm_helpdesk_threads"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_hd_threads_tenant_created" ON "crm_helpdesk_threads"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_hd_threads_conversation_id" ON "crm_helpdesk_threads"("conversation_id", "created_at" ASC);
CREATE INDEX IF NOT EXISTS "idx_hd_threads_created_by_user" ON "crm_helpdesk_threads"("created_by_user_id") WHERE "created_by_user_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_hd_threads_created_by_customer" ON "crm_helpdesk_threads"("created_by_customer_id") WHERE "created_by_customer_id" IS NOT NULL;

-- crm_helpdesk_attachments
CREATE INDEX IF NOT EXISTS "idx_hd_attachments_tenant_id" ON "crm_helpdesk_attachments"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_hd_attachments_thread_id" ON "crm_helpdesk_attachments"("thread_id");

-- ==============================================================================
-- SCHEMA: public (Personal CRM - 007-personal-crm)
-- ==============================================================================

-- crm_relationship_types
CREATE INDEX IF NOT EXISTS "idx_pcrm_rel_types_tenant_id" ON "crm_relationship_types"("tenant_id");

-- crm_contact_relationships (007-personal-crm)
CREATE INDEX IF NOT EXISTS "idx_pcrm_contact_rels_tenant_id" ON "crm_contact_relationships"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_pcrm_contact_rels_contact_id" ON "crm_contact_relationships"("contact_id");
CREATE INDEX IF NOT EXISTS "idx_pcrm_contact_rels_related_id" ON "crm_contact_relationships"("related_contact_id");
CREATE INDEX IF NOT EXISTS "idx_pcrm_contact_rels_type_id" ON "crm_contact_relationships"("relationship_type_id");

-- crm_life_events
CREATE INDEX IF NOT EXISTS "idx_pcrm_life_events_tenant_id" ON "crm_life_events"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_pcrm_life_events_tenant_created" ON "crm_life_events"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_pcrm_life_events_contact_id" ON "crm_life_events"("contact_id");
CREATE INDEX IF NOT EXISTS "idx_pcrm_life_events_happened_at" ON "crm_life_events"("contact_id", "happened_at" DESC);

-- crm_contact_gifts
CREATE INDEX IF NOT EXISTS "idx_pcrm_gifts_tenant_id" ON "crm_contact_gifts"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_pcrm_gifts_tenant_created" ON "crm_contact_gifts"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_pcrm_gifts_contact_id" ON "crm_contact_gifts"("contact_id");

-- crm_contact_debts
CREATE INDEX IF NOT EXISTS "idx_pcrm_debts_tenant_id" ON "crm_contact_debts"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_pcrm_debts_tenant_created" ON "crm_contact_debts"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_pcrm_debts_contact_id" ON "crm_contact_debts"("contact_id");

-- crm_contact_reminders
CREATE INDEX IF NOT EXISTS "idx_pcrm_reminders_tenant_id" ON "crm_contact_reminders"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_pcrm_reminders_tenant_created" ON "crm_contact_reminders"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_pcrm_reminders_contact_id" ON "crm_contact_reminders"("contact_id");
CREATE INDEX IF NOT EXISTS "idx_pcrm_reminders_active_due" ON "crm_contact_reminders"("tenant_id", "is_active", "next_due_date") WHERE "is_active" = true;

-- ==============================================================================
-- SCHEMA: public (Activities - 008-activities)
-- ==============================================================================

-- crm_contact_notes
CREATE INDEX IF NOT EXISTS "idx_act_notes_tenant_id" ON "crm_contact_notes"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_act_notes_tenant_created" ON "crm_contact_notes"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_act_notes_contact_id" ON "crm_contact_notes"("contact_id");
CREATE INDEX IF NOT EXISTS "idx_act_notes_created_by" ON "crm_contact_notes"("created_by_user_id") WHERE "created_by_user_id" IS NOT NULL;

-- crm_activities
CREATE INDEX IF NOT EXISTS "idx_act_activities_tenant_id" ON "crm_activities"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_act_activities_tenant_created" ON "crm_activities"("tenant_id", "created_at" DESC);

-- crm_activity_contacts
CREATE INDEX IF NOT EXISTS "idx_act_activity_contacts_activity_id" ON "crm_activity_contacts"("activity_id");
CREATE INDEX IF NOT EXISTS "idx_act_activity_contacts_contact_id" ON "crm_activity_contacts"("contact_id");
CREATE INDEX IF NOT EXISTS "idx_act_activity_contacts_tenant_id" ON "crm_activity_contacts"("tenant_id");

-- crm_call_logs
CREATE INDEX IF NOT EXISTS "idx_act_call_logs_tenant_id" ON "crm_call_logs"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_act_call_logs_tenant_created" ON "crm_call_logs"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_act_call_logs_contact_id" ON "crm_call_logs"("contact_id", "called_at" DESC);

-- crm_contact_tasks
CREATE INDEX IF NOT EXISTS "idx_act_tasks_tenant_id" ON "crm_contact_tasks"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_act_tasks_tenant_created" ON "crm_contact_tasks"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_act_tasks_contact_id" ON "crm_contact_tasks"("contact_id") WHERE "contact_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_act_tasks_assigned_to" ON "crm_contact_tasks"("assigned_to_user_id") WHERE "assigned_to_user_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_act_tasks_completed" ON "crm_contact_tasks"("tenant_id", "is_completed");

-- crm_contact_pets
CREATE INDEX IF NOT EXISTS "idx_act_pets_tenant_id" ON "crm_contact_pets"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_act_pets_contact_id" ON "crm_contact_pets"("contact_id");

-- ==============================================================================
-- SCHEMA: public (Loyalty - 009-loyalty)
-- ==============================================================================

-- crm_customer_segments
CREATE INDEX IF NOT EXISTS "idx_loy_segments_tenant_id" ON "crm_customer_segments"("tenant_id");

-- crm_segment_assignments
CREATE INDEX IF NOT EXISTS "idx_loy_seg_assign_tenant_id" ON "crm_segment_assignments"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_loy_seg_assign_segment_id" ON "crm_segment_assignments"("segment_id");
CREATE INDEX IF NOT EXISTS "idx_loy_seg_assign_contact_id" ON "crm_segment_assignments"("contact_id");

-- crm_product_preferences
CREATE INDEX IF NOT EXISTS "idx_loy_prod_prefs_tenant_id" ON "crm_product_preferences"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_loy_prod_prefs_contact_id" ON "crm_product_preferences"("contact_id");

-- ==============================================================================
-- SCHEMA: public (Helpdesk Advanced - 010-helpdesk-advanced)
-- ==============================================================================

-- crm_helpdesk_folders
CREATE INDEX IF NOT EXISTS "idx_hd_adv_folders_tenant_id" ON "crm_helpdesk_folders"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_hd_adv_folders_mailbox_id" ON "crm_helpdesk_folders"("mailbox_id");
CREATE INDEX IF NOT EXISTS "idx_hd_adv_folders_user_id" ON "crm_helpdesk_folders"("user_id") WHERE "user_id" IS NOT NULL;

-- crm_helpdesk_conversation_folders
CREATE INDEX IF NOT EXISTS "idx_hd_adv_conv_folders_folder_id" ON "crm_helpdesk_conversation_folders"("folder_id");
CREATE INDEX IF NOT EXISTS "idx_hd_adv_conv_folders_conv_id" ON "crm_helpdesk_conversation_folders"("conversation_id");

-- crm_helpdesk_customer_emails
CREATE INDEX IF NOT EXISTS "idx_hd_adv_cust_emails_tenant_id" ON "crm_helpdesk_customer_emails"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_hd_adv_cust_emails_customer_id" ON "crm_helpdesk_customer_emails"("customer_id");

-- crm_helpdesk_send_logs
CREATE INDEX IF NOT EXISTS "idx_hd_adv_send_logs_tenant_id" ON "crm_helpdesk_send_logs"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_hd_adv_send_logs_thread_id" ON "crm_helpdesk_send_logs"("thread_id") WHERE "thread_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_hd_adv_send_logs_customer_id" ON "crm_helpdesk_send_logs"("customer_id") WHERE "customer_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_hd_adv_send_logs_user_id" ON "crm_helpdesk_send_logs"("user_id") WHERE "user_id" IS NOT NULL;

-- crm_helpdesk_subscriptions
CREATE INDEX IF NOT EXISTS "idx_hd_adv_subs_tenant_id" ON "crm_helpdesk_subscriptions"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_hd_adv_subs_user_id" ON "crm_helpdesk_subscriptions"("userId");

-- ==============================================================================
-- SCHEMA: public (Helpdesk ITSM - 011-helpdesk-itsm)
-- ==============================================================================

-- crm_helpdesk_ticket_statuses
CREATE INDEX IF NOT EXISTS "idx_hd_itsm_statuses_tenant_id" ON "crm_helpdesk_ticket_statuses"("tenant_id");

-- crm_helpdesk_ticket_priorities
CREATE INDEX IF NOT EXISTS "idx_hd_itsm_priorities_tenant_id" ON "crm_helpdesk_ticket_priorities"("tenant_id");

-- crm_helpdesk_ticket_categories
CREATE INDEX IF NOT EXISTS "idx_hd_itsm_categories_tenant_id" ON "crm_helpdesk_ticket_categories"("tenant_id");

-- crm_helpdesk_agent_profiles
CREATE INDEX IF NOT EXISTS "idx_hd_itsm_agents_tenant_id" ON "crm_helpdesk_agent_profiles"("tenant_id");

-- crm_helpdesk_ticket_audits
CREATE INDEX IF NOT EXISTS "idx_hd_itsm_audits_tenant_id" ON "crm_helpdesk_ticket_audits"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_hd_itsm_audits_conversation_id" ON "crm_helpdesk_ticket_audits"("conversation_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_hd_itsm_audits_user_id" ON "crm_helpdesk_ticket_audits"("user_id") WHERE "user_id" IS NOT NULL;

-- ==============================================================================
-- SCHEMA: public (Shared - Outbox)
-- ==============================================================================

-- outbox_events (CRITICAL: polled by relay worker every ~5s)
CREATE INDEX IF NOT EXISTS "idx_outbox_events_published" ON "outbox_events"("published", "created_at" ASC) WHERE "published" = false;
CREATE INDEX IF NOT EXISTS "idx_outbox_events_aggregate_type" ON "outbox_events"("aggregate_type", "aggregate_id");

-- ==============================================================================
-- SCHEMA: auth
-- ==============================================================================

-- mfa_methods
CREATE INDEX IF NOT EXISTS "idx_auth_mfa_methods_tenant_id" ON "auth"."mfa_methods"("tenant_id");

-- sessions
CREATE INDEX IF NOT EXISTS "idx_auth_sessions_user_id" ON "auth"."sessions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_auth_sessions_tenant_user" ON "auth"."sessions"("tenant_id", "user_id");

-- ip_restrictions
CREATE INDEX IF NOT EXISTS "idx_auth_ip_restrictions_tenant_id" ON "auth"."ip_restrictions"("tenant_id");

-- password_history
CREATE INDEX IF NOT EXISTS "idx_auth_password_history_user_id" ON "auth"."password_history"("user_id", "created_at" DESC);

-- auth outbox_events (critical for relay)
CREATE INDEX IF NOT EXISTS "idx_auth_outbox_published" ON "auth"."outbox_events"("published", "created_at" ASC) WHERE "published" = false;
CREATE INDEX IF NOT EXISTS "idx_auth_outbox_event_type" ON "auth"."outbox_events"("event_type");

-- ==============================================================================
-- SCHEMA: users
-- ==============================================================================

-- natural_person_profiles
CREATE INDEX IF NOT EXISTS "idx_users_natural_profiles_tenant_id" ON "users"."natural_person_profiles"("tenant_id");

-- legal_entity_profiles
CREATE INDEX IF NOT EXISTS "idx_users_legal_profiles_tenant_id" ON "users"."legal_entity_profiles"("tenant_id");

-- user_oauth_links
CREATE INDEX IF NOT EXISTS "idx_users_oauth_links_user_id" ON "users"."user_oauth_links"("user_id");

-- users outbox_events
CREATE INDEX IF NOT EXISTS "idx_users_outbox_published" ON "users"."outbox_events"("published", "created_at" ASC) WHERE "published" = false;
CREATE INDEX IF NOT EXISTS "idx_users_outbox_event_type" ON "users"."outbox_events"("event_type");

-- ==============================================================================
-- SCHEMA: iam
-- ==============================================================================

-- iam outbox_events
CREATE INDEX IF NOT EXISTS "idx_iam_outbox_published" ON "iam"."outbox_events"("published", "created_at" ASC) WHERE "published" = false;
CREATE INDEX IF NOT EXISTS "idx_iam_outbox_event_type" ON "iam"."outbox_events"("event_type");

-- ==============================================================================
-- SCHEMA: tenants
-- ==============================================================================

-- tenant_domains
CREATE INDEX IF NOT EXISTS "idx_tenant_domains_tenant_id" ON "tenants"."tenant_domains"("tenant_id");

-- tenant_exchange_rates
CREATE INDEX IF NOT EXISTS "idx_tenant_exchange_rates_tenant_id" ON "tenants"."tenant_exchange_rates"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_exchange_rates_from" ON "tenants"."tenant_exchange_rates"("from_currency_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_exchange_rates_to" ON "tenants"."tenant_exchange_rates"("to_currency_id");

-- tenant_api_keys
CREATE INDEX IF NOT EXISTS "idx_tenant_api_keys_tenant_id" ON "tenants"."tenant_api_keys"("tenant_id");

-- tenant_webhooks
CREATE INDEX IF NOT EXISTS "idx_tenant_webhooks_tenant_id" ON "tenants"."tenant_webhooks"("tenant_id");

-- tenant_webhook_delivery_logs
CREATE INDEX IF NOT EXISTS "idx_tenant_webhook_delivery_webhook_id" ON "tenants"."tenant_webhook_delivery_logs"("webhook_id", "executed_at" DESC);

-- tenant_system_audit_logs
CREATE INDEX IF NOT EXISTS "idx_tenant_system_audit_tenant_id" ON "tenants"."tenant_system_audit_logs"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_tenant_system_audit_user_id" ON "tenants"."tenant_system_audit_logs"("user_id") WHERE "user_id" IS NOT NULL;

-- tenants outbox_events
CREATE INDEX IF NOT EXISTS "idx_tenant_outbox_published" ON "tenants"."outbox_events"("published", "created_at" ASC) WHERE "published" = false;
CREATE INDEX IF NOT EXISTS "idx_tenant_outbox_event_type" ON "tenants"."outbox_events"("event_type");

-- ==============================================================================
-- SCHEMA: notifications
-- ==============================================================================

-- notification_channels
CREATE INDEX IF NOT EXISTS "idx_notif_channels_tenant_id" ON "notifications"."notification_channels"("tenant_id");

-- notification_templates
CREATE INDEX IF NOT EXISTS "idx_notif_templates_tenant_id" ON "notifications"."notification_templates"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_notif_templates_channel_key" ON "notifications"."notification_templates"("channel_type", "template_key");

-- notification_queue (CRITICAL: polled by worker)
CREATE INDEX IF NOT EXISTS "idx_notif_queue_tenant_id" ON "notifications"."notification_queue"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_notif_queue_status_scheduled" ON "notifications"."notification_queue"("status", "scheduled_at" ASC) WHERE "status" = 'PENDING';
CREATE INDEX IF NOT EXISTS "idx_notif_queue_channel_type" ON "notifications"."notification_queue"("channel_type", "status");

-- notification_logs
CREATE INDEX IF NOT EXISTS "idx_notif_logs_tenant_id" ON "notifications"."notification_logs"("tenant_id", "sent_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_notif_logs_queue_id" ON "notifications"."notification_logs"("queue_id") WHERE "queue_id" IS NOT NULL;

-- notification_preferences
CREATE INDEX IF NOT EXISTS "idx_notif_prefs_tenant_id" ON "notifications"."notification_preferences"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_notif_prefs_user_channel" ON "notifications"."notification_preferences"("user_id", "channel_type");

-- notifications outbox_events
CREATE INDEX IF NOT EXISTS "idx_notif_outbox_published" ON "notifications"."outbox_events"("published", "created_at" ASC) WHERE "published" = false;
CREATE INDEX IF NOT EXISTS "idx_notif_outbox_event_type" ON "notifications"."outbox_events"("event_type");

-- ==============================================================================
-- SCHEMA: audit
-- ==============================================================================

-- audit_logs (CRITICAL: queried by entity, tenant, time range — high volume table)
CREATE INDEX IF NOT EXISTS "idx_audit_logs_tenant_id" ON "audit"."audit_logs"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity" ON "audit"."audit_logs"("entity_type", "entity_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_audit_logs_changed_by" ON "audit"."audit_logs"("changed_by_user_id") WHERE "changed_by_user_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_audit_logs_module" ON "audit"."audit_logs"("tenant_id", "module_name");

-- audit outbox_events
CREATE INDEX IF NOT EXISTS "idx_audit_outbox_published" ON "audit"."outbox_events"("published", "created_at" ASC) WHERE "published" = false;
CREATE INDEX IF NOT EXISTS "idx_audit_outbox_event_type" ON "audit"."outbox_events"("event_type");

-- ==============================================================================
-- SCHEMA: storage
-- ==============================================================================

-- files
CREATE INDEX IF NOT EXISTS "idx_storage_files_tenant_id" ON "storage"."files"("tenant_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_storage_files_entity" ON "storage"."files"("entity_type", "entity_id") WHERE "entity_type" IS NOT NULL AND "entity_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_storage_files_uploaded_by" ON "storage"."files"("uploaded_by_user_id") WHERE "uploaded_by_user_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_storage_files_storage_key" ON "storage"."files"("storage_key");
CREATE INDEX IF NOT EXISTS "idx_storage_files_deleted_at" ON "storage"."files"("deleted_at") WHERE "deleted_at" IS NOT NULL;

-- storage outbox_events
CREATE INDEX IF NOT EXISTS "idx_storage_outbox_published" ON "storage"."outbox_events"("published", "created_at" ASC) WHERE "published" = false;
CREATE INDEX IF NOT EXISTS "idx_storage_outbox_event_type" ON "storage"."outbox_events"("event_type");

-- ==============================================================================
-- SCHEMA: scheduler
-- ==============================================================================

-- scheduled_tasks (polled by scheduler worker)
CREATE INDEX IF NOT EXISTS "idx_sched_tasks_tenant_id" ON "scheduler"."scheduled_tasks"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_sched_tasks_next_run" ON "scheduler"."scheduled_tasks"("enabled", "next_run_at" ASC) WHERE "enabled" = true;
CREATE INDEX IF NOT EXISTS "idx_sched_tasks_type" ON "scheduler"."scheduled_tasks"("task_type");

-- task_executions
CREATE INDEX IF NOT EXISTS "idx_sched_executions_task_id" ON "scheduler"."task_executions"("task_id", "started_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_sched_executions_tenant_id" ON "scheduler"."task_executions"("tenant_id");

-- reminders (polled by reminder worker)
CREATE INDEX IF NOT EXISTS "idx_sched_reminders_tenant_id" ON "scheduler"."reminders"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_sched_reminders_due" ON "scheduler"."reminders"("tenant_id", "remind_at" ASC) WHERE "reminded" = false;
CREATE INDEX IF NOT EXISTS "idx_sched_reminders_user_id" ON "scheduler"."reminders"("user_id");

-- sla_configs
CREATE INDEX IF NOT EXISTS "idx_sched_sla_configs_tenant_id" ON "scheduler"."sla_configs"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_sched_sla_configs_entity" ON "scheduler"."sla_configs"("entity_type");

-- sla_violations
CREATE INDEX IF NOT EXISTS "idx_sched_sla_violations_tenant_id" ON "scheduler"."sla_violations"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_sched_sla_violations_config_id" ON "scheduler"."sla_violations"("sla_config_id");
CREATE INDEX IF NOT EXISTS "idx_sched_sla_violations_entity" ON "scheduler"."sla_violations"("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_sched_sla_violations_status" ON "scheduler"."sla_violations"("tenant_id", "status");

-- scheduler outbox_events
CREATE INDEX IF NOT EXISTS "idx_sched_outbox_published" ON "scheduler"."outbox_events"("published", "created_at" ASC) WHERE "published" = false;
CREATE INDEX IF NOT EXISTS "idx_sched_outbox_event_type" ON "scheduler"."outbox_events"("event_type");

COMMIT;
