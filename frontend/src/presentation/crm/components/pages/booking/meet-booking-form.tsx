'use client'

import React, { useState } from 'react'
import type { AvailableTimeSlot, CreateBookingAppointment } from '@crm/contracts'
import { Calendar, ArrowLeft } from 'lucide-react'

interface Props {
  slots: AvailableTimeSlot[]
  onSubmit: (dto: CreateBookingAppointment) => Promise<void>
}

export function MeetBookingForm({ slots, onSubmit }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<AvailableTimeSlot | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestNotes, setGuestNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot) return
    setSubmitting(true)
    try {
      await onSubmit({
        guestName,
        guestEmail,
        guestPhone: guestPhone || undefined,
        guestNotes: guestNotes || undefined,
        scheduledAt: selectedSlot.datetime,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!selectedSlot) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Selecciona una fecha y hora disponible
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {slots.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSlot(s)}
              className="p-3 border border-gray-200 rounded-xl text-left hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-xs group"
            >
              <div className="font-bold text-gray-900 group-hover:text-indigo-600">
                {new Date(s.datetime).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div className="text-gray-500 font-semibold mt-0.5">{s.time}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={() => setSelectedSlot(null)}
        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Cambiar horario ({selectedSlot.time})
      </button>
      <h3 className="text-base font-bold text-gray-900">Tus Datos de Contacto</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo *</label>
          <input
            type="text"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="ej. Juan Pérez"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico *</label>
          <input
            type="email"
            required
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="juan@empresa.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="+57 300 123 4567"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Notas o Preguntas</label>
          <textarea
            rows={2}
            value={guestNotes}
            onChange={(e) => setGuestNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="¿Qué te gustaría tratar en la reunión?"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
      >
        {submitting ? 'Confirmando...' : 'Confirmar Reserva'}
      </button>
    </form>
  )
}
