'use client'

import React, { useState } from 'react'
import { ApiCommissionsRepository } from '@src/infrastructure/crm/repositories/commissions/api-commissions.repository'
import type { CommissionCalculationModel } from '@crm/contracts'
import { X, Award, Sparkles } from 'lucide-react'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function CreateCommissionPlanModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [calculationModel, setCalculationModel] = useState<CommissionCalculationModel>('ACCELERATOR')
  const [baseRate, setBaseRate] = useState('5.0')
  const [acceleratorRate, setAcceleratorRate] = useState('8.5')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    setLoading(true)
    try {
      await ApiCommissionsRepository.createPlan({
        name,
        description,
        calculationModel,
        baseRate: Number(baseRate) || 5.0,
        acceleratorRate: Number(acceleratorRate) || undefined,
        tierRules: [
          { minQuotaPct: 100, rate: Number(acceleratorRate) || 8.5 },
          { minQuotaPct: 120, rate: (Number(acceleratorRate) || 8.5) + 3.0 },
        ],
        isActive: true,
      })
      onCreated()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error al crear plan de comisiones')
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
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Crear Plan de Comisiones & SPM</h3>
              <p className="text-xs text-muted-foreground">Configura reglas de compensación para tu fuerza comercial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">Nombre del Plan</label>
            <input
              type="text"
              required
              placeholder="Ej. Plan Enterprise AE 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
            />
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Modelo de Compensación</label>
            <select
              value={calculationModel}
              onChange={(e) => setCalculationModel(e.target.value as CommissionCalculationModel)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
            >
              <option value="ACCELERATOR">🚀 Tasa Base + Acelerador por Cuota 100%+</option>
              <option value="TIERED_QUOTA">📈 Tramos Escalonados por Rendimiento</option>
              <option value="FLAT_PERCENTAGE">💵 Porcentaje Fijo por Cierre</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Tasa Base (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={baseRate}
                onChange={(e) => setBaseRate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Tasa Acelerador 100%+ (%)</label>
              <input
                type="number"
                step="0.1"
                value={acceleratorRate}
                onChange={(e) => setAcceleratorRate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Descripción / Condiciones</label>
            <textarea
              rows={2}
              placeholder="Aplica para Deals Enterprise cerrados en estado WON..."
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
              <Sparkles size={14} /> {loading ? 'Creando...' : 'Guardar Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
