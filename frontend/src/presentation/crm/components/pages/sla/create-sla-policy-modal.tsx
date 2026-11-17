'use client'

import React, { useState } from 'react'
import { ApiSlaRepository } from '@src/infrastructure/crm/repositories/sla/api-sla.repository'
import type { SlaPriority } from '@crm/contracts'
import { X, Clock, Sparkles, ShieldAlert } from 'lucide-react'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function CreateSlaPolicyModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<SlaPriority>('HIGH')
  const [firstResponseTimeMinutes, setFirstResponseTimeMinutes] = useState('30')
  const [resolutionTimeMinutes, setResolutionTimeMinutes] = useState('240')
  const [businessHoursOnly, setBusinessHoursOnly] = useState(true)
  const [isDefault, setIsDefault] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    setLoading(true)
    try {
      await ApiSlaRepository.createPolicy({
        name,
        description,
        priority,
        firstResponseTimeMinutes: Number(firstResponseTimeMinutes) || 60,
        resolutionTimeMinutes: Number(resolutionTimeMinutes) || 240,
        businessHoursOnly,
        isDefault,
        isActive: true,
      })
      onCreated()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error al crear política de SLA')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Nueva Política de SLA</h3>
              <p className="text-xs text-muted-foreground">Tiempos de respuesta y resolución garantizados</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">Nombre de la Política</label>
            <input
              type="text"
              required
              placeholder="Ej. SLA Clientes VIP Platinum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Nivel de Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SlaPriority)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground font-bold"
              >
                <option value="CRITICAL">🔴 Crítica (Servicio Caído)</option>
                <option value="URGENT">🟠 Urgente (Impacto Mayor)</option>
                <option value="HIGH">🟡 Alta (Degradación)</option>
                <option value="MEDIUM">🔵 Media (Consulta General)</option>
                <option value="LOW">⚪ Baja (Solicitud Menor)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Primera Respuesta (Minutos)</label>
              <input
                type="number"
                required
                min="5"
                value={firstResponseTimeMinutes}
                onChange={(e) => setFirstResponseTimeMinutes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Resolución Final (Minutos)</label>
              <input
                type="number"
                required
                min="15"
                value={resolutionTimeMinutes}
                onChange={(e) => setResolutionTimeMinutes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
              />
            </div>
            <div className="flex flex-col justify-end space-y-1 pb-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="businessHoursOnly"
                  checked={businessHoursOnly}
                  onChange={(e) => setBusinessHoursOnly(e.target.checked)}
                  className="rounded border"
                />
                <label htmlFor="businessHoursOnly" className="text-foreground font-medium cursor-pointer text-[11px]">
                  Solo Horas Laborales (8x5)
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Descripción / Condiciones de Aplicación</label>
            <textarea
              rows={2}
              placeholder="Aplica exclusivamente a contratos con soporte prioritario..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles size={14} /> {loading ? 'Guardando...' : 'Crear Política SLA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
