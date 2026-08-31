-- ==============================================================================
-- MICROSERVICIO: TENANT SERVICE (tenant-db)
-- OBJETIVO: Índices para paginación keyset y consultas operativas (sin CONCURRENTLY:
--           no es válido dentro de una transacción explícita).
-- ==============================================================================

BEGIN;

CREATE INDEX IF NOT EXISTS "idx_tenants_created_keyset"
ON "tenants" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_branches_tenant_created_keyset"
ON "branches" ("tenant_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_tenant_saas_snapshot_synced"
ON "tenant_saas_snapshot" ("synced_at" DESC);

COMMIT;
