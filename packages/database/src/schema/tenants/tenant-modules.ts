import { tenantsSchema } from './tenants'
import { uuid, varchar, text, boolean, integer, numeric, timestamp, jsonb, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core'

export const systemModules = tenantsSchema.table('system_modules', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  description: text('description'),
  iconSvg: text('icon_svg'),
  category: varchar('category', { length: 50 }),
  isCore: boolean('is_core').default(false),
  isActive: boolean('is_active').default(true),
  version: varchar('version', { length: 20 }).default('1.0.0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const installedModules = tenantsSchema.table('installed_modules', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  moduleId: uuid('module_id').notNull(),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
  installedAt: timestamp('installed_at', { withTimezone: true }).defaultNow().notNull(),
  configurationJson: jsonb('configuration_json'),
}, (table) => ({
  uniqueTenantModule: uniqueIndex('idx_installed_modules_tenant_module').on(table.tenantId, table.moduleId),
}))

export const tenantTaxConfigurations = tenantsSchema.table('tenant_tax_configurations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  taxName: varchar('tax_name', { length: 100 }).notNull(),
  taxPercentage: numeric('tax_percentage', { precision: 5, scale: 2 }).notNull(),
  description: text('description'),
  taxType: varchar('tax_type', { length: 50 }).default('SALES'),
  debitAccountId: uuid('debit_account_id'),
  creditAccountId: uuid('credit_account_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTenantTax: uniqueIndex('idx_tenant_taxes_tenant_name').on(table.tenantId, table.taxName),
}))

export const globalSystemParameters = tenantsSchema.table('global_system_parameters', {
  paramKey: varchar('param_key', { length: 100 }).primaryKey(),
  paramValue: text('param_value').notNull(),
  description: text('description'),
  dataType: varchar('data_type', { length: 50 }).default('STRING'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
