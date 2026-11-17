import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { getDb, bookingLinks, bookingAppointments, contacts, notes } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import { BookingSlotsHelper } from './booking-slots.helper'
import { BookingMapper } from './booking.mapper'
import type {
  BookingLink,
  CreateBookingLink,
  BookingAppointment,
  CreateBookingAppointment,
  AvailableTimeSlot,
} from '@crm/contracts'

@Injectable()
export class BookingBffService {
  private readonly logger = new Logger(BookingBffService.name)
  private get db() {
    return getDb()
  }

  async createBookingLink(tenantId: string, userId: string, dto: CreateBookingLink): Promise<BookingLink> {
    const existing = await this.db
      .select()
      .from(bookingLinks)
      .where(and(eq(bookingLinks.tenantId, tenantId), eq(bookingLinks.slug, dto.slug)))
      .limit(1)

    if (existing.length > 0) {
      throw new BadRequestException(`El enlace con slug "${dto.slug}" ya existe. Elige otro.`)
    }

    const [created] = await this.db
      .insert(bookingLinks)
      .values({
        tenantId,
        userId,
        slug: dto.slug.toLowerCase().trim(),
        title: dto.title,
        description: dto.description || null,
        durationMinutes: dto.durationMinutes || 30,
        locationType: dto.locationType || 'GOOGLE_MEET',
        customLocation: dto.customLocation || null,
        availableDays: dto.availableDays || [1, 2, 3, 4, 5],
        startHour: dto.startHour || '09:00',
        endHour: dto.endHour || '18:00',
        bufferMinutes: dto.bufferMinutes || 15,
        isActive: true,
      })
      .returning()

    return BookingMapper.mapLink(created)
  }

  async listBookingLinks(tenantId: string, userId?: string): Promise<BookingLink[]> {
    const conditions = [eq(bookingLinks.tenantId, tenantId)]
    if (userId) conditions.push(eq(bookingLinks.userId, userId))

    const rows = await this.db
      .select()
      .from(bookingLinks)
      .where(and(...conditions))
      .orderBy(desc(bookingLinks.createdAt))

    return rows.map((r) => BookingMapper.mapLink(r))
  }

  async getPublicBookingPage(slug: string): Promise<{ link: BookingLink; availableSlots: AvailableTimeSlot[] }> {
    const [linkRow] = await this.db
      .select()
      .from(bookingLinks)
      .where(and(eq(bookingLinks.slug, slug.toLowerCase()), eq(bookingLinks.isActive, true)))
      .limit(1)

    if (!linkRow) {
      throw new NotFoundException(`Página de agendamiento no encontrada para el slug: "${slug}"`)
    }

    const link = BookingMapper.mapLink(linkRow)
    const slots = BookingSlotsHelper.generateSlots(link)

    return { link, availableSlots: slots }
  }

  async createPublicAppointment(slug: string, dto: CreateBookingAppointment): Promise<BookingAppointment> {
    const [linkRow] = await this.db
      .select()
      .from(bookingLinks)
      .where(and(eq(bookingLinks.slug, slug.toLowerCase()), eq(bookingLinks.isActive, true)))
      .limit(1)

    if (!linkRow) {
      throw new NotFoundException('Enlace de reserva inactivo o no encontrado')
    }

    const scheduledDate = new Date(dto.scheduledAt)
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Fecha de reserva inválida')
    }

    const meetCode = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5)
    const meetingUrl =
      linkRow.locationType === 'ZOOM'
        ? `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`
        : `https://meet.google.com/${meetCode}`

    const contactId = await this.syncContactAndTimeline(linkRow, dto, scheduledDate, meetingUrl)

    const [appointment] = await this.db
      .insert(bookingAppointments)
      .values({
        tenantId: linkRow.tenantId,
        bookingLinkId: linkRow.id,
        hostUserId: linkRow.userId,
        guestName: dto.guestName,
        guestEmail: dto.guestEmail.toLowerCase(),
        guestPhone: dto.guestPhone || null,
        guestNotes: dto.guestNotes || null,
        scheduledAt: scheduledDate,
        durationMinutes: linkRow.durationMinutes,
        meetingUrl,
        status: 'SCHEDULED',
        contactId,
      })
      .returning()

    this.logger.log(`Appointment created: ${appointment.id} for ${dto.guestEmail} on ${linkRow.title}`)
    return BookingMapper.mapAppointment(appointment)
  }

  async listAppointments(tenantId: string, hostUserId?: string): Promise<BookingAppointment[]> {
    const conditions = [eq(bookingAppointments.tenantId, tenantId)]
    if (hostUserId) conditions.push(eq(bookingAppointments.hostUserId, hostUserId))

    const rows = await this.db
      .select()
      .from(bookingAppointments)
      .where(and(...conditions))
      .orderBy(desc(bookingAppointments.scheduledAt))

    return rows.map((r) => BookingMapper.mapAppointment(r))
  }

  async cancelAppointment(tenantId: string, id: string, reason?: string): Promise<void> {
    await this.db
      .update(bookingAppointments)
      .set({
        status: 'CANCELLED',
        cancellationReason: reason || 'Cancelado por el anfitrión',
        updatedAt: new Date(),
      })
      .where(and(eq(bookingAppointments.id, id), eq(bookingAppointments.tenantId, tenantId)))
  }

  private async syncContactAndTimeline(linkRow: any, dto: CreateBookingAppointment, scheduledDate: Date, meetingUrl: string): Promise<string | null> {
    let contactId: string | null = null
    try {
      const [existingContact] = await this.db
        .select()
        .from(contacts)
        .where(and(eq(contacts.tenantId, linkRow.tenantId), eq(contacts.email, dto.guestEmail.toLowerCase())))
        .limit(1)

      if (existingContact) {
        contactId = existingContact.id
      } else {
        const nameParts = dto.guestName.trim().split(' ')
        const firstName = nameParts[0] || 'Invitado'
        const lastName = nameParts.slice(1).join(' ') || ''
        const [newContact] = await this.db
          .insert(contacts)
          .values({
            tenantId: linkRow.tenantId,
            firstName,
            lastName,
            email: dto.guestEmail.toLowerCase(),
            phone: dto.guestPhone || null,
            leadSource: 'BOOKING_PAGE',
          })
          .returning()
        contactId = newContact?.id || null
      }

      if (contactId) {
        await this.db.insert(notes).values({
          tenantId: linkRow.tenantId,
          contactId,
          authorUserId: linkRow.userId,
          content: `📅 [Cita Agendada]: ${linkRow.title}\nFecha: ${scheduledDate.toLocaleString('es-ES')}\nEnlace: ${meetingUrl}\nNotas: ${dto.guestNotes || 'Sin notas adicionales'}`,
        })
      }
    } catch (err) {
      this.logger.warn(`Could not sync contact for appointment: ${err}`)
    }
    return contactId
  }
}
