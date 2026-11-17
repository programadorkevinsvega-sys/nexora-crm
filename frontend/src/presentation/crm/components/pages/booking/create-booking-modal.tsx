'use client'

import React, { useState } from 'react'
import { ApiBookingRepository } from '@src/infrastructure/crm/repositories/booking/api-booking.repository'
import type { BookingLink } from '@crm/contracts'

interface Props {
  onClose: () => void
  onCreated: (link: BookingLink) => void
}

export function CreateBookingModal({ onClose, onCreated }: Props) {
  const [formSlug, setFormSlug] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formDuration, setFormDuration] = useState(30)
  const [formLocation, setFormLocation] = useState<'GOOGLE_MEET' | 'ZOOM'>('GOOGLE_MEET')
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const created = await ApiBookingRepository.createBookingLink({
        slug: formSlug,
        title: formTitle,
        description: formDesc || undefined,
        durationMinutes: Number(formDuration),
        locationType: formLocation,
        availableDays: [1, 2, 3, 4, 5],
        startHour: '09:00',
        endHour: '18:00',
        bufferMinutes: 15,
      })
      onCreated(created)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error al crear enlace')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crear Enlace de Reserva</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
            <input
              type="text"
              required
              placeholder="ej. Demo de Producto 30m"
              value={formTitle}
              onChange={(e) => {
                setFormTitle(e.target.value)
                if (!formSlug) setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Slug URL (/meet/:slug) *</label>
            <input
              type="text"
              required
              placeholder="ej. demo-30min"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Duración</label>
              <select
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Plataforma</label>
              <select
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="GOOGLE_MEET">Google Meet</option>
                <option value="ZOOM">Zoom</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea
              rows={2}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Breve descripción de la reunión..."
              className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
          >
            {submitting ? 'Guardando...' : 'Guardar Enlace'}
          </button>
        </div>
      </form>
    </div>
  )
}
