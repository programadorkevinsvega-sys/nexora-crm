import { pgSchema, uuid, varchar, text, boolean, timestamp, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core'

export const iamSchema = pgSchema('iam')

export const roles = iamSchema.table('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isSystemRole: boolean('is_system_role').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTenantRole: uniqueIndex('idx_roles_tenant_name').on(table.tenantId, table.name),
}))

export const permissions = iamSchema.table('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  module: varchar('module', { length: 100 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  description: text('description'),
}, (table) => ({
  uniqueModuleAction: uniqueIndex('idx_permissions_module_action').on(table.module, table.action),
}))

export const rolePermissions = iamSchema.table('role_permissions', {
  roleId: uuid('role_id').notNull(),
  permissionId: uuid('permission_id').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}))

export const userRoles = iamSchema.table('user_roles', {
  userId: uuid('user_id').notNull(),
  roleId: uuid('role_id').notNull(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id'),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] }),
}))
