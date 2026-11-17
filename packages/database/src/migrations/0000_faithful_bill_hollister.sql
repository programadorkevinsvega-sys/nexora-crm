CREATE SCHEMA "audit";
--> statement-breakpoint
CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "iam";
--> statement-breakpoint
CREATE SCHEMA "notifications";
--> statement-breakpoint
CREATE SCHEMA "scheduler";
--> statement-breakpoint
CREATE SCHEMA "storage";
--> statement-breakpoint
CREATE SCHEMA "tenants";
--> statement-breakpoint
CREATE SCHEMA "users";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"company_id" uuid,
	"address_type" varchar(50) DEFAULT 'BILLING',
	"address_line_1" varchar(255) NOT NULL,
	"address_line_2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(50),
	"country" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"tax_id" varchar(100),
	"website" varchar(255),
	"industry" varchar(100),
	"number_of_employees" integer,
	"annual_revenue" numeric(15, 2),
	"description" text,
	"parent_company_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"identification_type" varchar(50),
	"identification_number" varchar(100),
	"verification_digit" varchar(5),
	"email" varchar(255),
	"phone" varchar(50),
	"birth_date" date,
	"street_address" varchar(255),
	"city" varchar(255),
	"state_province" varchar(255),
	"postal_code" varchar(50),
	"country" varchar(100),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"nickname" varchar(255),
	"gender" varchar(50),
	"is_starred" boolean DEFAULT false,
	"is_deceased" boolean DEFAULT false,
	"stay_in_touch_frequency_days" integer,
	"last_talked_to_at" timestamp with time zone,
	"tax_regime" varchar(100),
	"is_tax_liable" boolean DEFAULT false,
	"job_title" varchar(100),
	"lead_source" varchar(100),
	"lead_status" varchar(50) DEFAULT 'NEW',
	"loyalty_points" integer DEFAULT 0,
	"avatar_url" varchar(255),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pipeline_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"contact_id" uuid,
	"company_id" uuid,
	"name" varchar(255) NOT NULL,
	"amount" numeric(15, 2) DEFAULT '0',
	"expected_close_date" date,
	"status" varchar(20) DEFAULT 'OPEN',
	"assigned_user_id" uuid,
	"lost_reason_id" uuid,
	"lost_notes" text,
	"partner_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"call_type" varchar(50) DEFAULT 'OUTBOUND',
	"duration_seconds" integer,
	"summary" text,
	"happened_at" timestamp with time zone NOT NULL,
	"author_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"company_id" uuid,
	"deal_id" uuid,
	"content" text NOT NULL,
	"author_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"company_id" uuid,
	"deal_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" timestamp with time zone NOT NULL,
	"is_completed" boolean DEFAULT false,
	"assigned_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pipeline_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pipeline_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"probability_percent" integer DEFAULT 0,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pipelines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(50) DEFAULT 'OPEN',
	"priority" varchar(50) DEFAULT 'MEDIUM',
	"assigned_user_id" uuid,
	"sla_id" uuid,
	"first_response_at" timestamp with time zone,
	"sla_breach_at" timestamp with time zone,
	"is_escalated" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_tags" (
	"contact_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	CONSTRAINT "contact_tags_contact_id_tag_id_pk" PRIMARY KEY("contact_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(20) DEFAULT '#E2E8F0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaign_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'SENT',
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100),
	"status" varchar(50) DEFAULT 'PLANNED',
	"start_date" date,
	"end_date" date,
	"budgeted_cost" numeric(15, 2) DEFAULT '0',
	"actual_cost" numeric(15, 2) DEFAULT '0',
	"expected_revenue" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"primary_contact_id" uuid NOT NULL,
	"related_contact_id" uuid NOT NULL,
	"relationship_type" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deal_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deal_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1',
	"unit_price" numeric(15, 2) NOT NULL,
	"discount_percent" numeric(5, 2) DEFAULT '0',
	"total_price" numeric(15, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"linked_entity_type" varchar(50) NOT NULL,
	"linked_entity_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"deal_id" uuid,
	"direction" varchar(20),
	"from_address" varchar(255) NOT NULL,
	"to_address" varchar(255) NOT NULL,
	"subject" varchar(500),
	"body_text" text,
	"body_html" text,
	"message_id" varchar(255),
	"status" varchar(50) DEFAULT 'SENT',
	"sent_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "field_history_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"field_name" varchar(100) NOT NULL,
	"old_value" text,
	"new_value" text,
	"changed_by_user_id" uuid NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"deal_id" uuid,
	"title" varchar(255) NOT NULL,
	"location" varchar(255),
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'SCHEDULED',
	"organizer_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deal_id" uuid NOT NULL,
	"quote_number" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'DRAFT',
	"valid_until" date NOT NULL,
	"terms_and_conditions" text,
	"subtotal" numeric(15, 2) DEFAULT '0',
	"tax_total" numeric(15, 2) DEFAULT '0',
	"grand_total" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"ticket_id" uuid NOT NULL,
	"author_type" varchar(50) NOT NULL,
	"author_id" uuid NOT NULL,
	"message" text NOT NULL,
	"is_internal_note" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"direction" varchar(20),
	"phone_number" varchar(50) NOT NULL,
	"message_body" text NOT NULL,
	"template_used" varchar(100),
	"status" varchar(50) DEFAULT 'DELIVERED',
	"sent_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"strengths" text,
	"weaknesses" text,
	"website" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"deal_id" uuid,
	"name" varchar(255) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"auto_renew" boolean DEFAULT false,
	"mrr_value" numeric(15, 2) DEFAULT '0',
	"status" varchar(50) DEFAULT 'ACTIVE',
	"owner_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deal_competitors" (
	"deal_id" uuid NOT NULL,
	"competitor_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"is_winner" boolean DEFAULT false,
	CONSTRAINT "deal_competitors_deal_id_competitor_id_pk" PRIMARY KEY("deal_id","competitor_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lost_reasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"partner_level" varchar(50),
	"commission_percent" numeric(5, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_quotas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"period_month" integer NOT NULL,
	"period_year" integer NOT NULL,
	"target_amount" numeric(15, 2) NOT NULL,
	"achieved_amount" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_team_members" (
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	CONSTRAINT "sales_team_members_team_id_user_id_pk" PRIMARY KEY("team_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"manager_user_id" uuid,
	"monthly_target" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "slas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"target_response_minutes" integer NOT NULL,
	"target_resolution_minutes" integer NOT NULL,
	"business_hours_only" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_affiliate_commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"affiliate_id" uuid NOT NULL,
	"source_order_id" uuid NOT NULL,
	"commission_amount" numeric(15, 2) NOT NULL,
	"mlm_level_earned" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'PENDING',
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_affiliate_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"affiliate_id" uuid NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"payment_method" varchar(100),
	"payment_reference" varchar(255),
	"status" varchar(50) DEFAULT 'PROCESSING',
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_affiliate_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"commission_type" varchar(50) NOT NULL,
	"commission_value" numeric(10, 2) NOT NULL,
	"cookie_duration_days" integer DEFAULT 30,
	"is_multi_level" boolean DEFAULT false,
	"max_mlm_levels" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_affiliates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"referral_code" varchar(50) NOT NULL,
	"referral_link" text NOT NULL,
	"parent_affiliate_id" uuid,
	"mlm_level" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'ACTIVE',
	"total_earnings" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_affiliates_referral_code_unique" UNIQUE("referral_code"),
	CONSTRAINT "crm_affiliates_referral_link_unique" UNIQUE("referral_link")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"partner_type" varchar(50) NOT NULL,
	"partner_tier" varchar(50) DEFAULT 'SILVER',
	"dedicated_account_manager_id" uuid,
	"status" varchar(50) DEFAULT 'ACTIVE',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_partner_deal_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"partner_id" uuid NOT NULL,
	"end_customer_name" varchar(255) NOT NULL,
	"end_customer_website" varchar(255),
	"estimated_deal_value" numeric(15, 2),
	"status" varchar(50) DEFAULT 'PENDING',
	"expiration_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"thread_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"storage_url" text NOT NULL,
	"is_inline" boolean DEFAULT false,
	"content_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"mailbox_id" uuid NOT NULL,
	"ticket_number" serial NOT NULL,
	"subject" varchar(255) NOT NULL,
	"customer_id" uuid,
	"customer_email" varchar(255) NOT NULL,
	"assignee_user_id" uuid,
	"status" varchar(50) DEFAULT 'OPEN',
	"priority" varchar(20) DEFAULT 'NORMAL',
	"source_channel" varchar(50) DEFAULT 'EMAIL',
	"preview_text" varchar(255),
	"has_attachments" boolean DEFAULT false,
	"last_reply_at" timestamp with time zone,
	"last_reply_from" varchar(50),
	"closed_at" timestamp with time zone,
	"estimated_hours" numeric(8, 2),
	"worked_hours" numeric(8, 2) DEFAULT '0',
	"due_date" timestamp with time zone,
	"first_response_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"is_internal" boolean DEFAULT false,
	"requires_approval" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_followers" (
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "crm_helpdesk_followers_conversation_id_user_id_pk" PRIMARY KEY("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_mailbox_users" (
	"mailbox_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'AGENT',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_helpdesk_mailbox_users_mailbox_id_user_id_pk" PRIMARY KEY("mailbox_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_mailboxes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"email_address" varchar(255) NOT NULL,
	"inbound_host" varchar(255),
	"inbound_port" integer DEFAULT 993,
	"inbound_protocol" varchar(20) DEFAULT 'IMAP',
	"inbound_encryption" varchar(20) DEFAULT 'SSL',
	"outbound_host" varchar(255),
	"outbound_port" integer DEFAULT 465,
	"outbound_encryption" varchar(20) DEFAULT 'SSL',
	"credentials_secret_id" varchar(255),
	"auto_reply_enabled" boolean DEFAULT false,
	"auto_reply_subject" varchar(255),
	"auto_reply_body" text,
	"signature_html" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"thread_type" varchar(50) NOT NULL,
	"created_by_user_id" uuid,
	"created_by_customer_id" uuid,
	"body_html" text,
	"body_text" text,
	"message_id_header" varchar(255),
	"in_reply_to_header" varchar(255),
	"to_addresses" text,
	"cc_addresses" text,
	"bcc_addresses" text,
	"is_draft" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_contact_debts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"direction" varchar(50) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(50) DEFAULT 'UNPAID',
	"due_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_contact_gifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"direction" varchar(50) DEFAULT 'GIVEN',
	"name" varchar(255) NOT NULL,
	"description" text,
	"url" text,
	"estimated_value" numeric(10, 2),
	"status" varchar(50) DEFAULT 'IDEA',
	"date_given_or_received" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_contact_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"related_contact_id" uuid NOT NULL,
	"relationship_type_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_contact_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"frequency_type" varchar(50) NOT NULL,
	"frequency_interval" integer DEFAULT 1,
	"next_due_date" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_life_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"happened_at" date NOT NULL,
	"is_yearly_recurring" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_relationship_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"reverse_name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"activity_type" varchar(100),
	"summary" varchar(255) NOT NULL,
	"description" text,
	"happened_at" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_activity_contacts" (
	"activity_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	CONSTRAINT "crm_activity_contacts_activity_id_contact_id_pk" PRIMARY KEY("activity_id","contact_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_call_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"called_at" timestamp with time zone NOT NULL,
	"content" text,
	"contact_called_me" boolean DEFAULT false NOT NULL,
	"duration_seconds" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_contact_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"body" text NOT NULL,
	"is_favorite" boolean DEFAULT false,
	"favorited_at" timestamp with time zone,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_contact_pets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"pet_category" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"breed" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_contact_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp with time zone,
	"due_date" timestamp with time zone,
	"assigned_to_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_customer_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"churn_risk_score" numeric(5, 4),
	"rfm_score" varchar(10),
	"nps_score" integer,
	"customer_satisfaction_score" numeric(5, 2),
	"calculated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "crm_customer_metrics_contact_id_unique" UNIQUE("contact_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_customer_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_dynamic" boolean DEFAULT false,
	"rules_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_loyalty_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"loyalty_points_balance" integer DEFAULT 0,
	"tier_level" varchar(50) DEFAULT 'BRONZE',
	"total_lifetime_value" numeric(15, 2) DEFAULT '0',
	"total_purchases_count" integer DEFAULT 0,
	"average_order_value" numeric(15, 2) DEFAULT '0',
	"last_purchase_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_loyalty_profiles_contact_id_unique" UNIQUE("contact_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_product_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"category_id" uuid,
	"product_id" uuid,
	"preference_level" varchar(50) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_segment_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"segment_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "crm_segment_assignments_segment_id_contact_id_unique" UNIQUE("segment_id","contact_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_conversation_folders" (
	"folder_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	CONSTRAINT "crm_helpdesk_conversation_folders_folder_id_conversation_id_pk" PRIMARY KEY("folder_id","conversation_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_customer_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"email_address" varchar(255) NOT NULL,
	"email_type" varchar(50) DEFAULT 'PRIMARY',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"mailbox_id" uuid NOT NULL,
	"user_id" uuid,
	"name" varchar(255) NOT NULL,
	"folder_type" varchar(50) DEFAULT 'CUSTOM',
	"total_count" integer DEFAULT 0,
	"active_count" integer DEFAULT 0,
	"metadata_json" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_send_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"thread_id" uuid,
	"customer_id" uuid,
	"user_id" uuid,
	"message_id" varchar(255),
	"recipient_email" varchar(255) NOT NULL,
	"email_type" varchar(50),
	"delivery_status" varchar(50) NOT NULL,
	"status_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_channel" varchar(50) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_helpdesk_subscriptions_tenant_id_user_id_notification_channel_event_type_unique" UNIQUE("tenant_id","user_id","notification_channel","event_type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_agent_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_available" boolean DEFAULT true,
	"agent_status" varchar(50) DEFAULT 'AVAILABLE',
	"assigned_categories_json" jsonb DEFAULT '[]'::jsonb,
	"active_tickets_count" integer DEFAULT 0,
	"resolved_tickets_count" integer DEFAULT 0,
	"average_resolution_hours" numeric(8, 2),
	"average_first_response_hours" numeric(8, 2),
	"last_assigned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_helpdesk_agent_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_ticket_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid,
	"action_type" varchar(100) NOT NULL,
	"old_value" text,
	"new_value" text,
	"details_json" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_ticket_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"color_hex" varchar(20) DEFAULT '#3498db',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_ticket_priorities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"level" integer DEFAULT 1,
	"color_hex" varchar(20) DEFAULT '#3498db',
	"sla_resolution_hours" integer,
	"sla_first_response_hours" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_helpdesk_ticket_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"color_hex" varchar(20) DEFAULT '#3498db',
	"is_closed_state" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit"."event_dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_event_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"source_service" varchar(150),
	"event_type" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"field_name" varchar(100),
	"old_value" text,
	"new_value" text,
	"changed_by_user_id" uuid,
	"module_name" varchar(100),
	"correlation_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."event_dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_event_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"source_service" varchar(150),
	"event_type" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."ip_restrictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid,
	"ip_address" varchar(50) NOT NULL,
	"type" varchar(20) DEFAULT 'ALLOW',
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."mfa_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"secret" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."mfa_recovery_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code_hash" varchar(255) NOT NULL,
	"is_used" boolean DEFAULT false,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."oauth_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider_name" varchar(50) NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"client_secret" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."password_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."password_policies" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"min_length" integer DEFAULT 8,
	"require_uppercase" boolean DEFAULT true,
	"require_numbers" boolean DEFAULT true,
	"require_symbols" boolean DEFAULT true,
	"expire_days" integer DEFAULT 90,
	"prevent_reuse_last_n" integer DEFAULT 3,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" varchar(255) NOT NULL,
	"ip_address" varchar(50),
	"user_agent" text,
	"device_id" varchar(255),
	"expires_at" timestamp with time zone NOT NULL,
	"is_revoked" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam"."event_dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_event_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"source_service" varchar(150),
	"event_type" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam"."permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module" varchar(100) NOT NULL,
	"action" varchar(100) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam"."role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam"."roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_system_role" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam"."user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"branch_id" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."event_dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_event_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"source_service" varchar(150),
	"event_type" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."notification_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"channel_type" varchar(50) NOT NULL,
	"provider_type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."notification_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"queue_id" uuid,
	"channel_type" varchar(50) NOT NULL,
	"to_address" varchar(500) NOT NULL,
	"subject" text,
	"body_preview" text,
	"status" varchar(50) NOT NULL,
	"provider_used" varchar(100),
	"provider_message_id" varchar(255),
	"error_message" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"user_id" uuid NOT NULL,
	"channel_type" varchar(50) NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."notification_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"channel_type" varchar(50) NOT NULL,
	"channel_id" uuid,
	"template_id" uuid,
	"to_address" varchar(500) NOT NULL,
	"subject" text,
	"body" text,
	"variables_used_json" jsonb,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"priority" integer DEFAULT 0,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3,
	"last_error" text,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications"."notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"channel_type" varchar(50) NOT NULL,
	"template_key" varchar(150) NOT NULL,
	"subject_template" text NOT NULL,
	"body_template" text NOT NULL,
	"variables_json" jsonb DEFAULT '[]'::jsonb,
	"locale" varchar(10) DEFAULT 'en',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"entity_type" varchar(100),
	"entity_id" uuid,
	"remind_at" timestamp with time zone NOT NULL,
	"reminded" boolean DEFAULT false NOT NULL,
	"notified" boolean DEFAULT false NOT NULL,
	"repeat_interval" varchar(50),
	"repeat_count" integer,
	"repeat_remaining" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."scheduled_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"cron_expression" varchar(100) NOT NULL,
	"task_type" varchar(100) NOT NULL,
	"target_service" varchar(150),
	"target_endpoint" varchar(500),
	"target_payload" jsonb,
	"enabled" boolean DEFAULT true NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"timeout_seconds" integer DEFAULT 300,
	"created_by_user_id" uuid,
	"last_run_at" timestamp with time zone,
	"next_run_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."event_dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_event_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"source_service" varchar(150),
	"event_type" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."sla_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"condition_field" varchar(100),
	"condition_operator" varchar(50),
	"condition_value" varchar(500),
	"response_time_minutes" integer NOT NULL,
	"resolution_time_minutes" integer,
	"escalation_user_id" uuid,
	"escalation_email" varchar(255),
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."sla_violations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sla_config_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"violation_type" varchar(50) NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"escalated_at" timestamp with time zone,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduler"."task_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"tenant_id" uuid,
	"status" varchar(50) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"result_payload" jsonb,
	"error_message" text,
	"attempt_number" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage"."files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"original_name" varchar(500) NOT NULL,
	"mime_type" varchar(127) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"storage_key" varchar(1000) NOT NULL,
	"bucket" varchar(255) NOT NULL,
	"uploaded_by_user_id" uuid,
	"entity_type" varchar(100),
	"entity_id" uuid,
	"metadata_json" jsonb,
	"checksum_sha256" varchar(64),
	"is_public" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage"."event_dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_event_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"source_service" varchar(150),
	"event_type" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"last_four_chars" varchar(4) NOT NULL,
	"scopes_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_currencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"iso_code" varchar(3) NOT NULL,
	"name" varchar(100) NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"is_base_currency" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"from_currency_id" uuid NOT NULL,
	"to_currency_id" uuid NOT NULL,
	"rate" numeric(15, 6) NOT NULL,
	"effective_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"iso_code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_system_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid,
	"module_name" varchar(100) NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"entity_name" varchar(100) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"old_values_json" jsonb,
	"new_values_json" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"translation_key" varchar(255) NOT NULL,
	"translation_value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_webhook_delivery_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"webhook_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload_json" jsonb NOT NULL,
	"attempt_number" integer DEFAULT 1,
	"response_status_code" integer,
	"response_body" text,
	"status" varchar(50) DEFAULT 'PENDING',
	"executed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_webhook_events" (
	"webhook_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	CONSTRAINT "tenant_webhook_events_webhook_id_event_type_pk" PRIMARY KEY("webhook_id","event_type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"endpoint_url" text NOT NULL,
	"secret_key" varchar(255),
	"is_active" boolean DEFAULT true,
	"max_retries" integer DEFAULT 3,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."global_system_parameters" (
	"param_key" varchar(100) PRIMARY KEY NOT NULL,
	"param_value" text NOT NULL,
	"description" text,
	"data_type" varchar(50) DEFAULT 'STRING',
	"is_public" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."installed_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE',
	"installed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"configuration_json" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."system_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon_svg" text,
	"category" varchar(50),
	"is_core" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"version" varchar(20) DEFAULT '1.0.0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_tax_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tax_name" varchar(100) NOT NULL,
	"tax_percentage" numeric(5, 2) NOT NULL,
	"description" text,
	"tax_type" varchar(50) DEFAULT 'SALES',
	"debit_account_id" uuid,
	"credit_account_id" uuid,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."event_dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_event_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"source_service" varchar(150),
	"event_type" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"is_active" boolean DEFAULT true,
	"is_headquarters" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_branding" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"logo_url" text,
	"favicon_url" text,
	"primary_color" varchar(20) DEFAULT '#3B82F6',
	"secondary_color" varchar(20) DEFAULT '#1E293B',
	"custom_domain" varchar(255),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"domain" varchar(255) NOT NULL,
	"ssl_status" varchar(50) DEFAULT 'PENDING',
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_features" (
	"tenant_id" uuid NOT NULL,
	"feature_code" varchar(100) NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"enabled_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_features_tenant_id_feature_code_pk" PRIMARY KEY("tenant_id","feature_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_saas_snapshot" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"platform_subscription_id" uuid,
	"platform_plan_id" uuid,
	"plan_slug" varchar(120),
	"plan_display_name" varchar(255),
	"subscription_status" varchar(32),
	"current_period_end" timestamp with time zone,
	"platform_invoice_id" uuid,
	"invoice_number" varchar(128),
	"invoice_status" varchar(24),
	"invoice_total_minor" bigint,
	"invoice_currency" varchar(3),
	"invoice_payment_state" varchar(24) DEFAULT 'UNKNOWN' NOT NULL,
	"paid_in_full" boolean DEFAULT false NOT NULL,
	"last_payment_at" timestamp with time zone,
	"external_subscription_ref" varchar(255),
	"external_invoice_ref" varchar(255),
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenant_usage_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"metric_name" varchar(100) NOT NULL,
	"current_value" bigint DEFAULT 0 NOT NULL,
	"limit_value" bigint,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants"."tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"legal_name" varchar(255),
	"tax_id" varchar(100),
	"tax_regime" varchar(100),
	"legal_address" text,
	"city" varchar(100),
	"postal_code" varchar(20),
	"industry_type" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE',
	"timezone" varchar(100) DEFAULT 'UTC',
	"currency_code" varchar(10) DEFAULT 'USD',
	"owner_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."event_dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_event_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"source_service" varchar(150),
	"event_type" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."inbox_events" (
	"event_id" uuid NOT NULL,
	"tenant_id" uuid,
	"source" varchar(150) NOT NULL,
	"handler" varchar(150) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_events_event_id_handler_pk" PRIMARY KEY("event_id","handler")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"published" boolean DEFAULT false,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."legal_entity_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"commercial_name" varchar(255),
	"tax_id" varchar(50) NOT NULL,
	"legal_address" text,
	"country_code" varchar(5),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."natural_person_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"identification_number" varchar(50),
	"phone" varchar(50),
	"country_code" varchar(5),
	"preferred_language" varchar(5) DEFAULT 'es',
	"timezone" varchar(100) DEFAULT 'America/Bogota',
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."user_mobile_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"device_identifier" varchar(255) NOT NULL,
	"platform" varchar(50) NOT NULL,
	"device_model" varchar(100),
	"os_version" varchar(50),
	"push_notification_token" text,
	"is_trusted_device" boolean DEFAULT false,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."user_oauth_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider_name" varchar(50) NOT NULL,
	"provider_user_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"profile_id" uuid NOT NULL,
	"profile_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"is_email_verified" boolean DEFAULT false,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"manager_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "addresses" ADD CONSTRAINT "addresses_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "addresses" ADD CONSTRAINT "addresses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deals" ADD CONSTRAINT "deals_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deals" ADD CONSTRAINT "deals_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deals" ADD CONSTRAINT "deals_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deals" ADD CONSTRAINT "deals_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calls" ADD CONSTRAINT "calls_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaign_members" ADD CONSTRAINT "campaign_members_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaign_members" ADD CONSTRAINT "campaign_members_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contact_relationships" ADD CONSTRAINT "contact_relationships_primary_contact_id_contacts_id_fk" FOREIGN KEY ("primary_contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contact_relationships" ADD CONSTRAINT "contact_relationships_related_contact_id_contacts_id_fk" FOREIGN KEY ("related_contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deal_line_items" ADD CONSTRAINT "deal_line_items_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emails" ADD CONSTRAINT "emails_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emails" ADD CONSTRAINT "emails_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meetings" ADD CONSTRAINT "meetings_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meetings" ADD CONSTRAINT "meetings_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quotes" ADD CONSTRAINT "quotes_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contracts" ADD CONSTRAINT "contracts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contracts" ADD CONSTRAINT "contracts_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deal_competitors" ADD CONSTRAINT "deal_competitors_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deal_competitors" ADD CONSTRAINT "deal_competitors_competitor_id_competitors_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partners" ADD CONSTRAINT "partners_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_quotas" ADD CONSTRAINT "sales_quotas_team_id_sales_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."sales_teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_team_members" ADD CONSTRAINT "sales_team_members_team_id_sales_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."sales_teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_affiliate_commissions" ADD CONSTRAINT "crm_affiliate_commissions_affiliate_id_crm_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."crm_affiliates"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_affiliate_payouts" ADD CONSTRAINT "crm_affiliate_payouts_affiliate_id_crm_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."crm_affiliates"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_affiliates" ADD CONSTRAINT "crm_affiliates_program_id_crm_affiliate_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."crm_affiliate_programs"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_partner_deal_registrations" ADD CONSTRAINT "crm_partner_deal_registrations_partner_id_crm_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."crm_partners"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_helpdesk_attachments" ADD CONSTRAINT "crm_helpdesk_attachments_thread_id_crm_helpdesk_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."crm_helpdesk_threads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_helpdesk_conversations" ADD CONSTRAINT "crm_helpdesk_conversations_mailbox_id_crm_helpdesk_mailboxes_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."crm_helpdesk_mailboxes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_helpdesk_followers" ADD CONSTRAINT "crm_helpdesk_followers_conversation_id_crm_helpdesk_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."crm_helpdesk_conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_helpdesk_mailbox_users" ADD CONSTRAINT "crm_helpdesk_mailbox_users_mailbox_id_crm_helpdesk_mailboxes_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."crm_helpdesk_mailboxes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_helpdesk_threads" ADD CONSTRAINT "crm_helpdesk_threads_conversation_id_crm_helpdesk_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."crm_helpdesk_conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_contact_relationships" ADD CONSTRAINT "crm_contact_relationships_relationship_type_id_crm_relationship_types_id_fk" FOREIGN KEY ("relationship_type_id") REFERENCES "public"."crm_relationship_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_activity_contacts" ADD CONSTRAINT "crm_activity_contacts_activity_id_crm_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."crm_activities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_segment_assignments" ADD CONSTRAINT "crm_segment_assignments_segment_id_crm_customer_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."crm_customer_segments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_helpdesk_conversation_folders" ADD CONSTRAINT "crm_helpdesk_conversation_folders_folder_id_crm_helpdesk_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."crm_helpdesk_folders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_helpdesk_conversation_folders" ADD CONSTRAINT "crm_helpdesk_conversation_folders_conversation_id_crm_helpdesk_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."crm_helpdesk_conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_helpdesk_folders" ADD CONSTRAINT "crm_helpdesk_folders_mailbox_id_crm_helpdesk_mailboxes_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."crm_helpdesk_mailboxes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_helpdesk_send_logs" ADD CONSTRAINT "crm_helpdesk_send_logs_thread_id_crm_helpdesk_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."crm_helpdesk_threads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_helpdesk_ticket_audits" ADD CONSTRAINT "crm_helpdesk_ticket_audits_conversation_id_crm_helpdesk_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."crm_helpdesk_conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deals_tenant_created" ON "deals" ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deals_pipeline_stage" ON "deals" ("pipeline_id","stage_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deals_stage" ON "deals" ("stage_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deals_assigned_user" ON "deals" ("assigned_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_outbox_published_created" ON "outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_outbox_aggregate" ON "outbox_events" ("aggregate_type","aggregate_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_tenant_created" ON "audit"."audit_logs" ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity" ON "audit"."audit_logs" ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_module" ON "audit"."audit_logs" ("tenant_id","module_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_outbox_published_created" ON "audit"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_outbox_event_type" ON "audit"."outbox_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_outbox_published_created" ON "auth"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_outbox_event_type" ON "auth"."outbox_events" ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_oauth_providers_tenant_provider" ON "auth"."oauth_providers" ("tenant_id","provider_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iam_outbox_published_created" ON "iam"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iam_outbox_event_type" ON "iam"."outbox_events" ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_permissions_module_action" ON "iam"."permissions" ("module","action");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_roles_tenant_name" ON "iam"."roles" ("tenant_id","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notif_outbox_published_created" ON "notifications"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notif_outbox_event_type" ON "notifications"."outbox_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notif_queue_status_scheduled" ON "notifications"."notification_queue" ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notif_queue_channel_status" ON "notifications"."notification_queue" ("channel_type","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_reminders_due" ON "scheduler"."reminders" ("tenant_id","remind_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_tasks_next_run" ON "scheduler"."scheduled_tasks" ("enabled","next_run_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_tasks_type" ON "scheduler"."scheduled_tasks" ("task_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_outbox_published_created" ON "scheduler"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_outbox_event_type" ON "scheduler"."outbox_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_sla_violations_entity" ON "scheduler"."sla_violations" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_sla_violations_config" ON "scheduler"."sla_violations" ("sla_config_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sched_exec_task_started" ON "scheduler"."task_executions" ("task_id","started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_files_entity" ON "storage"."files" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_files_key" ON "storage"."files" ("storage_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_outbox_published_created" ON "storage"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_outbox_event_type" ON "storage"."outbox_events" ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tenant_currencies_tenant_iso" ON "tenants"."tenant_currencies" ("tenant_id","iso_code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tenant_languages_tenant_iso" ON "tenants"."tenant_languages" ("tenant_id","iso_code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tenant_translations_key" ON "tenants"."tenant_translations" ("tenant_id","language_id","translation_key");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_installed_modules_tenant_module" ON "tenants"."installed_modules" ("tenant_id","module_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tenant_taxes_tenant_name" ON "tenants"."tenant_tax_configurations" ("tenant_id","tax_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tenant_outbox_published_created" ON "tenants"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tenant_outbox_event_type" ON "tenants"."outbox_events" ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_usage_metric_period" ON "tenants"."tenant_usage_metrics" ("tenant_id","metric_name","period_start");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_outbox_published_created" ON "users"."outbox_events" ("published","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_outbox_event_type" ON "users"."outbox_events" ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_mobile_devices_user_device" ON "users"."user_mobile_devices" ("user_id","device_identifier");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_oauth_provider" ON "users"."user_oauth_links" ("provider_name","provider_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_tenant_email" ON "users"."users" ("tenant_id","email");