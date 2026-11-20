CREATE TABLE IF NOT EXISTS "users"."tenant_member_invitations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "email" varchar(255) NOT NULL,
  "role_id" uuid NOT NULL,
  "invited_by" uuid NOT NULL,
  "token_hash" varchar(64),
  "status" varchar(20) NOT NULL DEFAULT 'PENDING',
  "expires_at" timestamp with time zone NOT NULL,
  "accepted_at" timestamp with time zone,
  "accepted_user_id" uuid,
  "revoked_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "ck_user_member_invitation_status"
    CHECK ("status" IN ('PENDING', 'ACCEPTING', 'ACCEPTED', 'REVOKED', 'EXPIRED')),
  CONSTRAINT "ck_user_member_invitation_email_lowercase"
    CHECK ("email" = lower("email"))
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_member_invitation_token_hash"
  ON "users"."tenant_member_invitations" ("token_hash")
  WHERE "token_hash" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_member_invitation_active_email"
  ON "users"."tenant_member_invitations" ("tenant_id", "email")
  WHERE "status" IN ('PENDING', 'ACCEPTING');

CREATE INDEX IF NOT EXISTS "idx_user_member_invitation_tenant_status_created"
  ON "users"."tenant_member_invitations" ("tenant_id", "status", "created_at" DESC);
