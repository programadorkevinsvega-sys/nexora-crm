'use client'

import React from 'react'
import type { BookingAppointment } from '@crm/contracts'
import { Video } from 'lucide-react'

interface Props {
  appointments: BookingAppointment[]
}

export function BookingAppointmentsTable({ appointments }: Props) {
  if (appointments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-sm text-gray-500">
        No tienes citas programadas aún.
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-left font-medium">
          <tr>
            <th className="px-4 py-3">Invitado</th>
            <th className="px-4 py-3">Fecha y Hora</th>
            <th className="px-4 py-3">Duración</th>
            <th className="px-4 py-3">Enlace Reunión</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {appointments.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
              <td className="px-4 py-3">
                <div className="font-semibold text-gray-900 dark:text-white">{a.guestName}</div>
                <div className="text-xs text-gray-500">{a.guestEmail}</div>
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {new Date(a.scheduledAt).toLocaleString('es-ES')}
              </td>
              <td className="px-4 py-3 text-gray-500">{a.durationMinutes} min</td>
              <td className="px-4 py-3">
                {a.meetingUrl ? (
                  <a
                    href={a.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    <Video className="w-3.5 h-3.5" /> Unirse
                  </a>
                ) : (
                  <span className="text-gray-400 text-xs">N/A</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
