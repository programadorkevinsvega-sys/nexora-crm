import { BookingLinkSchema, BookingAppointmentSchema, type BookingLink, type BookingAppointment } from '@crm/contracts'
import { bookingLinks, bookingAppointments } from '@crm/database'

export class BookingMapper {
  static mapLink(row: typeof bookingLinks.$inferSelect): BookingLink {
    return BookingLinkSchema.parse({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  }

  static mapAppointment(row: typeof bookingAppointments.$inferSelect): BookingAppointment {
    return BookingAppointmentSchema.parse({
      ...row,
      scheduledAt: row.scheduledAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  }
}