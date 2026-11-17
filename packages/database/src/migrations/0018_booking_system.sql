CREATE TABLE IF NOT EXISTS "booking_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "slug" varchar(100) NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "duration_minutes" integer DEFAULT 30 NOT NULL,
  "location_type" varchar(30) DEFAULT 'GOOGLE_MEET' NOT NULL,
  "custom_location" text,
  "available_days" jsonb DEFAULT '[1,2,3,4,5]'::jsonb NOT NULL,
  "start_hour" varchar(10) DEFAULT '09:00' NOT NULL,
  "end_hour" varchar(10) DEFAULT '18:00' NOT NULL,
  "buffer_minutes" integer DEFAULT 15 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "booking_links_tenant_idx" ON "booking_links" ("tenant_id");
CREATE INDEX IF NOT EXISTS "booking_links_slug_idx" ON "booking_links" ("slug");
CREATE INDEX IF NOT EXISTS "booking_links_user_idx" ON "booking_links" ("tenant_id", "user_id");

CREATE TABLE IF NOT EXISTS "booking_appointments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "booking_link_id" uuid NOT NULL REFERENCES "booking_links"("id") ON DELETE CASCADE,
  "host_user_id" uuid NOT NULL,
  "guest_name" varchar(255) NOT NULL,
  "guest_email" varchar(255) NOT NULL,
  "guest_phone" varchar(50),
  "guest_notes" text,
  "scheduled_at" timestamp with time zone NOT NULL,
  "duration_minutes" integer DEFAULT 30 NOT NULL,
  "meeting_url" text,
  "status" varchar(30) DEFAULT 'SCHEDULED' NOT NULL,
  "cancellation_reason" text,
  "contact_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "booking_appointments_tenant_idx" ON "booking_appointments" ("tenant_id");
CREATE INDEX IF NOT EXISTS "booking_appointments_link_idx" ON "booking_appointments" ("booking_link_id");
CREATE INDEX IF NOT EXISTS "booking_appointments_date_idx" ON "booking_appointments" ("scheduled_at");
CREATE INDEX IF NOT EXISTS "booking_appointments_host_idx" ON "booking_appointments" ("host_user_id", "scheduled_at");
