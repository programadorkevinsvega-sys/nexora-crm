import { z } from 'zod'

export const LocationTypeSchema = z.enum(['GOOGLE_MEET', 'ZOOM', 'PHONE', 'CUSTOM'])
export type LocationType = z.infer<typeof LocationTypeSchema>

export const BookingLinkSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  slug: z.string().min(2).max(100),
  title: z.string().min(2).max(255),
  description: z.string().nullable().optional(),
  durationMinutes: z.number().int().positive().default(30),
  locationType: LocationTypeSchema.default('GOOGLE_MEET'),
  customLocation: z.string().nullable().optional(),
  availableDays: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]),
  startHour: z.string().default('09:00'),
  endHour: z.string().default('18:00'),
  bufferMinutes: z.number().int().default(15),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type BookingLink = z.infer<typeof BookingLinkSchema>

export const CreateBookingLinkSchema = z.object({
  slug: z.string().min(2).max(100),
  title: z.string().min(2).max(255),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive().default(30),
  locationType: LocationTypeSchema.default('GOOGLE_MEET'),
  customLocation: z.string().optional(),
  availableDays: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]),
  startHour: z.string().default('09:00'),
  endHour: z.string().default('18:00'),
  bufferMinutes: z.number().int().default(15),
})
export type CreateBookingLink = z.infer<typeof CreateBookingLinkSchema>

export const BookingStatusSchema = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
export type BookingStatus = z.infer<typeof BookingStatusSchema>

export const BookingAppointmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  bookingLinkId: z.string().uuid(),
  hostUserId: z.string().uuid(),
  guestName: z.string().min(1).max(255),
  guestEmail: z.string().email(),
  guestPhone: z.string().nullable().optional(),
  guestNotes: z.string().nullable().optional(),
  scheduledAt: z.string(),
  durationMinutes: z.number().int().positive().default(30),
  meetingUrl: z.string().nullable().optional(),
  status: BookingStatusSchema.default('SCHEDULED'),
  cancellationReason: z.string().nullable().optional(),
  contactId: z.string().uuid().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type BookingAppointment = z.infer<typeof BookingAppointmentSchema>

export const CreateBookingAppointmentSchema = z.object({
  guestName: z.string().min(1).max(255),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  guestNotes: z.string().optional(),
  scheduledAt: z.string(),
})
export type CreateBookingAppointment = z.infer<typeof CreateBookingAppointmentSchema>

export interface AvailableTimeSlot {
  time: string // '09:00'
  datetime: string // ISO string
  available: boolean
}
