'use client'

import React, { useState, useEffect } from 'react'
import { ApiBookingRepository } from '@src/infrastructure/crm/repositories/booking/api-booking.repository'
import type { BookingLink, AvailableTimeSlot, BookingAppointment, CreateBookingAppointment } from '@crm/contracts'
import { Clock, Video } from 'lucide-react'
import { MeetConfirmedView } from './meet-confirmed-view'
import { MeetBookingForm } from './meet-booking-form'

export function PublicMeetPage({ slug }: { slug: string }) {
  const [data, setData] = useState<{ link: BookingLink; availableSlots: AvailableTimeSlot[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmedAppointment, setConfirmedAppointment] = useState<BookingAppointment | null>(null)

  useEffect(() => {
    ApiBookingRepository.getPublicBookingPage(slug)
      .then(setData)
      .catch((err: any) => setError(err?.message || 'Página de reserva no encontrada'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleBook = async (dto: CreateBookingAppointment) => {
    try {
      const appt = await ApiBookingRepository.createPublicAppointment(slug, dto)
      setConfirmedAppointment(appt)
    } catch (err: any) {
      alert(err.message || 'Error al agendar cita')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Enlace no disponible</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (confirmedAppointment) {
    return <MeetConfirmedView link={data.link} appointment={confirmedAppointment} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 overflow-hidden border border-gray-100">
        <div className="p-6 md:p-8 bg-indigo-900 text-white space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">Nexora Meet</span>
            <h1 className="text-2xl font-bold mt-1">{data.link.title}</h1>
          </div>
          <div className="space-y-3 text-sm text-indigo-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-300" />
              <span>{data.link.durationMinutes} minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-300" />
              <span>{data.link.locationType}</span>
            </div>
          </div>
          {data.link.description && (
            <p className="text-xs text-indigo-200 leading-relaxed border-t border-indigo-800 pt-4">
              {data.link.description}
            </p>
          )}
        </div>

        <div className="p-6 md:p-8 md:col-span-2 space-y-6">
          <MeetBookingForm slots={data.availableSlots} onSubmit={handleBook} />
        </div>
      </div>
    </div>
  )
}
