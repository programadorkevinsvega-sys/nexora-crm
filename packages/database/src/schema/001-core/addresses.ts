import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'
import { contacts } from './contacts'
import { companies } from './companies'

export const addresses = pgTable('addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  addressType: varchar('address_type', { length: 50 }).default('BILLING'),
  addressLine1: varchar('address_line_1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line_2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 50 }),
  country: varchar('country', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
