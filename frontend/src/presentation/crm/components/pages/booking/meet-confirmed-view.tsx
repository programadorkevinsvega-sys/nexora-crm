'use client'

import React from 'react'
import type { BookingLink, BookingAppointment } from '@crm/contracts'
import { CheckCircle2, Video } from 'lucide-react'

interface Props {
  link: BookingLink
  appointment: BookingAppointment
}

export function MeetConfirmedView({ link, appointment }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-lg w-full space-y-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">¡Reunión Agendada con Éxito!</h2>
        <p className="text-sm text-gray-600">
          Hemos reservado tu cita con <strong>{link.title}</strong> para el{' '}
          {new Date(appointment.scheduledAt).toLocaleString('es-ES')}.
        </p>
        {appointment.meetingUrl && (
          <div className="p-4 bg-indigo-50 rounded-xl space-y-2">
            <span className="text-xs font-semibold text-indigo-700">Enlace de Videollamada:</span>
            <div>
              <a
                href={appointment.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                <Video className="w-4 h-4" /> Entrar a la Reunión
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
