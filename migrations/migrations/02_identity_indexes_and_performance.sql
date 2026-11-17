-- ==============================================================================
-- MICROSERVICIO: IDENTITY SERVICE (identity-db)
-- OBJETIVO: Optimización de Rendimiento y Cumplimiento de Estándares (Skill: database-production-architect)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. ÍNDICES DE PAGINACIÓN EFICIENTE (KEYSET PAGINATION)
-- Evitamos el uso de OFFSET en queries grandes.
-- ==============================================================================

-- Paginación de usuarios por fecha de creación (Ej: "Nuevos usuarios registrados")
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_users_tenant_created_keyset" 
ON "users"("tenant_id", "created_at" DESC);

-- Paginación alfabética de usuarios (Ej: Directorio de empleados)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_users_tenant_name_keyset" 
ON "users"("tenant_id", "last_name", "first_name");

-- Búsqueda rápida de sesiones activas (Evita Full Table Scan al validar tokens)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_sessions_tenant_expires" 
ON "sessions"("tenant_id", "expires_at" DESC) 
WHERE "is_revoked" = false;

-- ==============================================================================
-- 2. ÍNDICES PARA JOINS Y FOREIGN KEYS (Prevención de Deadlocks)
-- ==============================================================================

-- FK: manager_id en users
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_users_manager_id" 
ON "users"("manager_id");

-- FK: user_id en mfa_methods
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_mfa_methods_user_id" 
ON "mfa_methods"("user_id");

-- FK: user_id en mfa_recovery_codes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_mfa_recovery_codes_user_id" 
ON "mfa_recovery_codes"("user_id");

-- FKs en role_permissions (Tabla intermedia)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_role_permissions_role_id" 
ON "role_permissions"("role_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_role_permissions_permission_id" 
ON "role_permissions"("permission_id");

-- FKs en user_roles (Tabla intermedia)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_roles_user_id" 
ON "user_roles"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_roles_role_id" 
ON "user_roles"("role_id");

-- FK: user_id en ip_restrictions
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_ip_restrictions_user_id" 
ON "ip_restrictions"("user_id");

-- ==============================================================================
-- 3. RESTRICCIONES DE INTEGRIDAD Y SEGURIDAD (Data Quality)
-- ==============================================================================

-- Prevenir emails en mayúsculas o con espacios (Normalización a nivel DB)
ALTER TABLE "users" 
ADD CONSTRAINT "chk_users_email_lowercase" 
CHECK ("email" = LOWER(TRIM("email")));

-- Prevenir fechas de expiración en el pasado al crear sesiones
ALTER TABLE "sessions" 
ADD CONSTRAINT "chk_sessions_expires_future" 
CHECK ("expires_at" > "created_at");

COMMIT;
