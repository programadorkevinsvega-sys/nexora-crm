import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core'

export const bookingLinks = pgTable(
  'booking_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    userId: uuid('user_id').notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    durationMinutes: integer('duration_minutes').default(30).notNull(),
    locationType: varchar('location_type', { length: 30 }).default('GOOGLE_MEET').notNull(),
    customLocation: text('custom_location'),
    availableDays: jsonb('available_days').$type<number[]>().default([1, 2, 3, 4, 5]).notNull(),
    startHour: varchar('start_hour', { length: 10 }).default('09:00').notNull(),
    endHour: varchar('end_hour', { length: 10 }).default('18:00').notNull(),
    bufferMinutes: integer('buffer_minutes').default(15).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('booking_links_tenant_idx').on(table.tenantId),
    slugIdx: index('booking_links_slug_idx').on(table.slug),
    userIdx: index('booking_links_user_idx').on(table.tenantId, table.userId),
  }),
)

export const bookingAppointments = pgTable(
  'booking_appointments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    bookingLinkId: uuid('booking_link_id').references(() => bookingLinks.id).notNull(),
    hostUserId: uuid('host_user_id').notNull(),
    guestName: varchar('guest_name', { length: 255 }).notNull(),
    guestEmail: varchar('guest_email', { length: 255 }).notNull(),
    guestPhone: varchar('guest_phone', { length: 50 }),
    guestNotes: text('guest_notes'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    durationMinutes: integer('duration_minutes').default(30).notNull(),
    meetingUrl: text('meeting_url'),
    status: varchar('status', { length: 30 }).default('SCHEDULED').notNull(),
    cancellationReason: text('cancellation_reason'),
    contactId: uuid('contact_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('booking_appointments_tenant_idx').on(table.tenantId),
    linkIdx: index('booking_appointments_link_idx').on(table.bookingLinkId),
    dateIdx: index('booking_appointments_date_idx').on(table.scheduledAt),
    hostIdx: index('booking_appointments_host_idx').on(table.hostUserId, table.scheduledAt),
  }),
)
