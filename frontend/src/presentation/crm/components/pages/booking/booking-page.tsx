'use client'

import React, { useState, useEffect } from 'react'
import { ApiBookingRepository } from '@src/infrastructure/crm/repositories/booking/api-booking.repository'
import type { BookingLink, BookingAppointment } from '@crm/contracts'
import { Calendar, Clock, Plus, Copy, Check, ExternalLink } from 'lucide-react'
import { CreateBookingModal } from './create-booking-modal'
import { BookingAppointmentsTable } from './booking-appointments-table'

export function BookingPage() {
  const [activeTab, setActiveTab] = useState<'LINKS' | 'APPOINTMENTS'>('LINKS')
  const [links, setLinks] = useState<BookingLink[]>([])
  const [appointments, setAppointments] = useState<BookingAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [l, a] = await Promise.all([
        ApiBookingRepository.listBookingLinks(),
        ApiBookingRepository.listAppointments(),
      ])
      setLinks(l)
      setAppointments(a)
    } finally {
      setLoading(false)
    }
  }

  const copyUrl = (slug: string, id: string) => {
    const url = `${window.location.origin}/meet/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-600" />
            Agendamiento Inteligente & Booking
          </h1>
          <p className="text-sm text-gray-500">Páginas de reserva tipo Calendly con Google Meet y Zoom</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Enlace de Reserva
        </button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('LINKS')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'LINKS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Mis Enlaces ({links.length})
        </button>
        <button
          onClick={() => setActiveTab('APPOINTMENTS')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'APPOINTMENTS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Citas Programadas ({appointments.length})
        </button>
      </div>

      {activeTab === 'LINKS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((l) => (
            <div
              key={l.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm hover:border-indigo-500 transition-all"
            >
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {l.locationType}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {l.durationMinutes} min
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{l.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{l.description || 'Sin descripción'}</p>
              </div>
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => copyUrl(l.slug, l.id)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5"
                >
                  {copiedId === l.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === l.id ? '¡Copiado!' : 'Copiar enlace'}
                </button>
                <a
                  href={`/meet/${l.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  Ver <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'APPOINTMENTS' && <BookingAppointmentsTable appointments={appointments} />}

      {showModal && (
        <CreateBookingModal
          onClose={() => setShowModal(false)}
          onCreated={(link) => setLinks([link, ...links])}
        />
      )}
    </div>
  )
}
