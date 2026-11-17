import type {
  BookingLink,
  CreateBookingLink,
  BookingAppointment,
  CreateBookingAppointment,
  AvailableTimeSlot,
} from '@crm/contracts'

export class ApiBookingRepository {
  static async listBookingLinks(): Promise<BookingLink[]> {
    const res = await fetch('/api/booking/links', { credentials: 'include' })
    if (!res.ok) return []
    return res.json()
  }

  static async createBookingLink(dto: CreateBookingLink): Promise<BookingLink> {
    const res = await fetch('/api/booking/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Error al crear el enlace de reserva')
    }
    return res.json()
  }

  static async getPublicBookingPage(
    slug: string,
  ): Promise<{ link: BookingLink; availableSlots: AvailableTimeSlot[] }> {
    const res = await fetch(`/api/booking/public/${slug}`)
    if (!res.ok) {
      throw new Error('Página de reserva no encontrada')
    }
    return res.json()
  }

  static async createPublicAppointment(
    slug: string,
    dto: CreateBookingAppointment,
  ): Promise<BookingAppointment> {
    const res = await fetch(`/api/booking/public/${slug}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Error al agendar la reunión')
    }
    return res.json()
  }

  static async listAppointments(): Promise<BookingAppointment[]> {
    const res = await fetch('/api/booking/appointments', { credentials: 'include' })
    if (!res.ok) return []
    return res.json()
  }

  static async cancelAppointment(id: string, reason?: string): Promise<void> {
    await fetch(`/api/booking/appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    })
  }
}
