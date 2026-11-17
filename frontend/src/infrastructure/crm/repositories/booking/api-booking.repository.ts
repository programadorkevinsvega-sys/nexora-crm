import type {
  BookingLink,
  CreateBookingLink,
  BookingAppointment,
  CreateBookingAppointment,
  AvailableTimeSlot,
} from '@crm/contracts'
import { api } from '../../api/api-client'

export class ApiBookingRepository {
  static async listBookingLinks(): Promise<BookingLink[]> {
    return api.get<BookingLink[]>('/api/booking/links')
  }

  static async createBookingLink(dto: CreateBookingLink): Promise<BookingLink> {
    return api.post<BookingLink>('/api/booking/links', dto)
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
    return api.get<BookingAppointment[]>('/api/booking/appointments')
  }

  static async cancelAppointment(id: string, reason?: string): Promise<void> {
    await api.patch<{ success: boolean }>(`/api/booking/appointments/${id}/cancel`, { reason })
  }
}
