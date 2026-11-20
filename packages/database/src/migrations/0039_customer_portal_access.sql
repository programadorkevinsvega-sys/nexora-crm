CREATE SCHEMA IF NOT EXISTS customer_portal;

CREATE TABLE IF NOT EXISTS customer_portal.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  invited_by UUID NOT NULL,
  token_hash VARCHAR(64),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_portal_invitation_token
  ON customer_portal.invitations (token_hash)
  WHERE token_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_portal_invitation_active_contact
  ON customer_portal.invitations (tenant_id, contact_id)
  WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_customer_portal_invitation_tenant_status
  ON customer_portal.invitations (tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS customer_portal.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'DISABLED')),
  email_verified_at TIMESTAMPTZ NOT NULL,
  refresh_token_hash VARCHAR(255),
  refresh_token_expires_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT customer_portal_account_tenant_contact_unique UNIQUE (tenant_id, contact_id),
  CONSTRAINT customer_portal_account_tenant_email_unique UNIQUE (tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_customer_portal_account_tenant_status
  ON customer_portal.accounts (tenant_id, status);
