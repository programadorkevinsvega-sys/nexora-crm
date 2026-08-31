import {
  pgTable, uuid, varchar, text, boolean, integer, jsonb, timestamp, index, uniqueIndex
} from 'drizzle-orm/pg-core'
import { contacts } from '../001-core/contacts'

export const webForms = pgTable(
  'web_forms',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).default('Contáctanos').notNull(),
    description: text('description'),
    fields: jsonb('fields').default([]).notNull(),
    buttonText: varchar('button_text', { length: 100 }).default('Enviar Solicitud').notNull(),
    successMessage: text('success_message').default('¡Gracias! Hemos recibido tu información correctamente.').notNull(),
    redirectUrl: text('redirect_url'),
    leadSource: varchar('lead_source', { length: 100 }).default('Formulario Web').notNull(),
    defaultLeadStatus: varchar('default_lead_status', { length: 50 }).default('NEW').notNull(),
    defaultTags: jsonb('default_tags').default([]).notNull(),
    assignToUserId: uuid('assign_to_user_id'),
    primaryColor: varchar('primary_color', { length: 50 }).default('#06b6d4').notNull(),
    backgroundColor: varchar('background_color', { length: 50 }).default('#09090b').notNull(),
    textColor: varchar('text_color', { length: 50 }).default('#f4f4f5').notNull(),
    borderRadius: varchar('border_radius', { length: 20 }).default('12px').notNull(),
    customCss: text('custom_css'),
    submissionsCount: integer('submissions_count').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantSlugIdx: uniqueIndex('web_forms_tenant_slug_idx').on(table.tenantId, table.slug),
    tenantActiveIdx: index('web_forms_tenant_active_idx').on(table.tenantId, table.isActive),
  }),
)

export const webFormSubmissions = pgTable(
  'web_form_submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    formId: uuid('form_id').notNull().references(() => webForms.id, { onDelete: 'cascade' }),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    payloadJson: jsonb('payload_json').notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantFormIdx: index('web_form_subs_tenant_form_idx').on(table.tenantId, table.formId),
    tenantSubmittedIdx: index('web_form_subs_tenant_submitted_idx').on(table.tenantId, table.submittedAt),
  }),
)
