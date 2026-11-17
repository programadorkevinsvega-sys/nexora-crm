'use client'

import React, { useState } from 'react'
import { ApiSurveysRepository } from '@src/infrastructure/crm/repositories/surveys/api-surveys.repository'
import type { SurveyType, SurveyTriggerEvent } from '@crm/contracts'
import { X, Sparkles, HeartHandshake } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateSurveyModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [type, setType] = useState<SurveyType>('NPS')
  const [triggerEvent, setTriggerEvent] = useState<SurveyTriggerEvent>('TICKET_RESOLVED')
  const [questionText, setQuestionText] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !questionText) return

    setLoading(true)
    try {
      await ApiSurveysRepository.createSurvey({
        name,
        type,
        triggerEvent,
        questionText,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error al crear encuesta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-border p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
              <HeartHandshake size={20} />
            </div>
            <h2 className="text-base font-bold text-foreground">Nueva Encuesta de Satisfacción</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">Nombre de la Encuesta</label>
            <input
              type="text"
              required
              placeholder="Ej. Evaluación de Calidad de Soporte"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border bg-background text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Métrica</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SurveyType)}
                className="w-full px-3 py-2 rounded-xl border bg-background text-foreground"
              >
                <option value="NPS">NPS (Net Promoter Score 0-10)</option>
                <option value="CSAT">CSAT (Customer Satisfaction 1-5)</option>
                <option value="CES">CES (Customer Effort Score 1-7)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Disparador Automático</label>
              <select
                value={triggerEvent}
                onChange={(e) => setTriggerEvent(e.target.value as SurveyTriggerEvent)}
                className="w-full px-3 py-2 rounded-xl border bg-background text-foreground"
              >
                <option value="TICKET_RESOLVED">Ticket de Soporte Resuelto</option>
                <option value="DEAL_WON">Negocio Ganado (Deal Won)</option>
                <option value="MANUAL">Envío Manual / Campaña</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Pregunta Principal al Cliente</label>
            <textarea
              rows={3}
              required
              placeholder="¿Qué tan satisfecho estás con la atención recibida?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border bg-background text-foreground"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border font-bold text-muted-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-xs"
            >
              {loading ? 'Creando...' : 'Guardar y Activar Encuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
