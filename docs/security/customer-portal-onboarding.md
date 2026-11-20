# Customer portal onboarding and authentication (P0.5)

## Scope

This flow creates an external customer identity for an existing CRM contact. It is separate from users.users, tenant staff invitations, IAM role assignments, and the employee login flow. A customer portal account is linked to exactly one (tenantId, contactId) pair.

## Lifecycle

1. A tenant administrator with a current IAM admin assignment opens a contact record and sends a portal invitation.
2. The BFF resolves the contact through the Contacts gRPC API and uses the contact's current email. The API Core access module persists the invitation in customer_portal.invitations.
3. The API generates a 256-bit random token; only its SHA-256 hash is stored. The raw token is delivered through the transient-email notification path. The link carries the token in the URL fragment, which is removed from browser history before the frontend submits it.
4. The public preview and acceptance operations validate the token, current contact email, expiry and one-time state. The customer chooses a password (minimum 12 characters, upper/lowercase, number and symbol; maximum 72 UTF-8 bytes for bcrypt).
5. Acceptance atomically consumes the invitation and creates a verified, active portal account in customer_portal.accounts. No CRM employee user or IAM role is created.
6. The customer signs in using tenant ID, email and password. The API emits a short-lived access JWT and a 30-day refresh JWT. Refresh tokens are stored as bcrypt hashes and rotated atomically; a replayed refresh token is rejected.

## Token profile

Access JWT claims: sub=portalAccountId, tenantId, contactId, email, customerPortal=true, tokenType=access, issuer nexora-crm, audience nexora-customer-portal, 15-minute expiry.

Refresh JWT has the same identity binding but tokenType=refresh, audience nexora-customer-portal:refresh, and a 30-day expiry. It cannot authenticate to portal business endpoints. The BFF guard requires the exact issuer, audience, access token type and a UUID contact claim, then enforces the portal route allowlist.

The frontend uses separate session keys: portal_access_token, portal_refresh_token, portal_tenant_id, and portal_account_id. These keys are never sent to CRM endpoints.

## BFF endpoints

Customer-facing public endpoints (rate-limited):
- POST /api/customer-portal/invitations/preview
- POST /api/customer-portal/invitations/accept
- POST /api/customer-portal/auth/login
- POST /api/customer-portal/auth/refresh

Authenticated portal endpoint:
- POST /api/customer-portal/auth/logout

Tenant-admin endpoints (regular CRM JWT plus live tenant-admin authorization):
- POST /api/tenant/customer-portal/invitations with contactId
- GET /api/tenant/customer-portal/invitations?contactId=...
- POST /api/tenant/customer-portal/invitations/:id/resend
- DELETE /api/tenant/customer-portal/invitations/:id

## Configuration and migration

- Apply database migration 0039_customer_portal_access.sql.
- Set APP_PUBLIC_URL to the public frontend origin. Production requires HTTPS.
- The existing transient email provider configuration must be operational. A failed delivery leaves the invitation record available for resend; the BFF never returns the raw token.
- JWT_SECRET remains required by API Core and is used by the portal token issuer.

## Safety properties

- No customer portal account can be created without a still-valid email invitation.
- The account is uniquely constrained by tenant/contact and tenant/email.
- Invitation acceptance is single-use; the row transition and account creation share a database transaction.
- Tenant admin permissions are resolved from current IAM assignments, not client-supplied role names.
- The portal JWT contact and tenant are derived from the consumed invitation, never from the login request.
- Customer portal tokens cannot call CRM team, contact-management, or tenant-administration endpoints.
