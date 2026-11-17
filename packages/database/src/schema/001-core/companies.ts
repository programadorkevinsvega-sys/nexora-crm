import { pgTable, uuid, varchar, integer, numeric, text, timestamp, index } from 'drizzle-orm/pg-core'

export const companies = pgTable(
  'companies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    taxId: varchar('tax_id', { length: 100 }),
    website: varchar('website', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    email: varchar('email', { length: 255 }),
    country: varchar('country', { length: 100 }),
    city: varchar('city', { length: 100 }),
    address: text('address'),
    industry: varchar('industry', { length: 100 }),
    numberOfEmployees: integer('number_of_employees'),
    annualRevenue: numeric('annual_revenue', { precision: 15, scale: 2 }),
    description: text('description'),
    parentCompanyId: uuid('parent_company_id'),
    linkedinUrl: varchar('linkedin_url', { length: 255 }),
    logoUrl: text('logo_url'),
    lifecycleStage: varchar('lifecycle_stage', { length: 50 }).default('PROSPECT'), // 'LEAD' | 'PROSPECT' | 'CUSTOMER' | 'CHURNED' | 'PARTNER'
    assignedUserId: uuid('assigned_user_id'),
    healthScore: integer('health_score').default(100),
    tier: varchar('tier', { length: 30 }).default('TIER_2'), // 'TIER_1_VIP' | 'TIER_2' | 'TIER_3'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantCreatedIdx: index('idx_companies_tenant_created').on(table.tenantId, table.createdAt),
    tenantNameIdx: index('idx_companies_tenant_name').on(table.tenantId, table.name),
    tenantTaxIdIdx: index('idx_companies_tenant_tax_id').on(table.tenantId, table.taxId),
    tenantIndustryIdx: index('idx_companies_tenant_industry').on(table.tenantId, table.industry),
    tenantLifecycleIdx: index('idx_companies_tenant_lifecycle').on(table.tenantId, table.lifecycleStage),
  }),
)
