import { pgTable, uuid, varchar, numeric, timestamp, text, boolean, integer, primaryKey, date } from 'drizzle-orm/pg-core'
import { companies } from '../001-core/companies'
import { deals } from '../001-core/deals'

export const salesTeams = pgTable('sales_teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  managerUserId: uuid('manager_user_id'),
  monthlyTarget: numeric('monthly_target', { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const salesTeamMembers = pgTable('sales_team_members', {
  teamId: uuid('team_id').notNull().references(() => salesTeams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  tenantId: uuid('tenant_id').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.teamId, t.userId] }),
}))

export const salesQuotas = pgTable('sales_quotas', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id').notNull(),
  teamId: uuid('team_id').references(() => salesTeams.id, { onDelete: 'cascade' }),
  periodMonth: integer('period_month').notNull(),
  periodYear: integer('period_year').notNull(),
  targetAmount: numeric('target_amount', { precision: 15, scale: 2 }).notNull(),
  achievedAmount: numeric('achieved_amount', { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const lostReasons = pgTable('lost_reasons', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const competitors = pgTable('competitors', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  strengths: text('strengths'),
  weaknesses: text('weaknesses'),
  website: varchar('website', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const dealCompetitors = pgTable('deal_competitors', {
  dealId: uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  competitorId: uuid('competitor_id').notNull().references(() => competitors.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull(),
  isWinner: boolean('is_winner').default(false),
}, (t) => ({
  pk: primaryKey({ columns: [t.dealId, t.competitorId] }),
}))

export const contracts = pgTable('contracts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  autoRenew: boolean('auto_renew').default(false),
  mrrValue: numeric('mrr_value', { precision: 15, scale: 2 }).default('0'),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
  ownerUserId: uuid('owner_user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const slas = pgTable('slas', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  targetResponseMinutes: integer('target_response_minutes').notNull(),
  targetResolutionMinutes: integer('target_resolution_minutes').notNull(),
  businessHoursOnly: boolean('business_hours_only').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const partners = pgTable('partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  partnerLevel: varchar('partner_level', { length: 50 }),
  commissionPercent: numeric('commission_percent', { precision: 5, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
