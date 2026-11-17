import { pgTable, uuid, varchar, timestamp, primaryKey } from 'drizzle-orm/pg-core'

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  color: varchar('color', { length: 20 }).default('#E2E8F0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const contactTags = pgTable('contact_tags', {
  contactId: uuid('contact_id').notNull(),
  tagId: uuid('tag_id').notNull(),
  tenantId: uuid('tenant_id').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.contactId, t.tagId] }),
}))
