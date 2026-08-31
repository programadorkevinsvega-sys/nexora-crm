import { pgTable, uuid, varchar, integer, numeric, text, timestamp, boolean, jsonb, date, index } from 'drizzle-orm/pg-core'
import { companies } from './companies'

export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),

  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }),
  identificationType: varchar('identification_type', { length: 50 }),
  identificationNumber: varchar('identification_number', { length: 100 }),
  verificationDigit: varchar('verification_digit', { length: 5 }),

  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  birthDate: date('birth_date'),

  streetAddress: varchar('street_address', { length: 255 }),
  city: varchar('city', { length: 255 }),
  stateProvince: varchar('state_province', { length: 255 }),
  postalCode: varchar('postal_code', { length: 50 }),
  country: varchar('country', { length: 100 }),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),

  nickname: varchar('nickname', { length: 255 }),
  gender: varchar('gender', { length: 50 }),
  isStarred: boolean('is_starred').default(false),
  isDeceased: boolean('is_deceased').default(false),
  stayInTouchFrequencyDays: integer('stay_in_touch_frequency_days'),
  lastTalkedToAt: timestamp('last_talked_to_at', { withTimezone: true }),

  taxRegime: varchar('tax_regime', { length: 100 }),
  isTaxLiable: boolean('is_tax_liable').default(false),
  jobTitle: varchar('job_title', { length: 100 }),
  leadSource: varchar('lead_source', { length: 100 }),
  leadStatus: varchar('lead_status', { length: 50 }).default('NEW'),
  loyaltyPoints: integer('loyalty_points').default(0),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  metadata: jsonb('metadata').default({}),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tenantCreatedIdx: index('idx_contacts_tenant_created').on(table.tenantId, table.createdAt),
  tenantEmailIdx: index('idx_contacts_tenant_email').on(table.tenantId, table.email),
  tenantPhoneIdx: index('idx_contacts_tenant_phone').on(table.tenantId, table.phone),
  tenantStatusIdx: index('idx_contacts_tenant_status').on(table.tenantId, table.leadStatus),
  tenantCompanyIdx: index('idx_contacts_tenant_company').on(table.tenantId, table.companyId),
}))
