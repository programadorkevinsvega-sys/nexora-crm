import type { BookingLink, BookingAppointment } from '@crm/contracts'
import { bookingLinks, bookingAppointments } from '@crm/database'

export class BookingMapper {
  static mapLink(r: typeof bookingLinks.$inferSelect): BookingLink {
    return {
      ...r,
      description: r.description ?? undefined,
      customLocation: r.customLocation ?? undefined,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }

  static mapAppointment(r: typeof bookingAppointments.$inferSelect): BookingAppointment {
    return {
      ...r,
      guestPhone: r.guestPhone ?? undefined,
      guestNotes: r.guestNotes ?? undefined,
      meetingUrl: r.meetingUrl ?? undefined,
      cancellationReason: r.cancellationReason ?? undefined,
      contactId: r.contactId ?? undefined,
      scheduledAt: r.scheduledAt ? new Date(r.scheduledAt).toISOString() : new Date().toISOString(),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }
}
