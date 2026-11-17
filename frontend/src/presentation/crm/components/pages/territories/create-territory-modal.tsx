'use client'

import React, { useState } from 'react'
import { ApiTerritoriesRepository } from '@src/infrastructure/crm/repositories/territories/api-territories.repository'
import { X, MapPin, Sparkles } from 'lucide-react'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function CreateTerritoryModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [countriesText, setCountriesText] = useState('CO, PE, EC')
  const [industriesText, setIndustriesText] = useState('SAAS, FINTECH, LOGISTICS')
  const [quotaTargetUsd, setQuotaTargetUsd] = useState('150000')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code) return

    const countryCodes = countriesText.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
    const industries = industriesText.split(',').map((ind) => ind.trim().toUpperCase()).filter(Boolean)

    setLoading(true)
    try {
      await ApiTerritoriesRepository.createTerritory({
        name,
        code: code.toUpperCase(),
        description,
        countryCodes,
        regions: ['Latinoamérica'],
        industries,
        quotaTargetUsd: Number(quotaTargetUsd) || 100000,
        isActive: true,
      })
      onCreated()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error al crear territorio de ventas')
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
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Crear Territorio de Ventas</h3>
              <p className="text-xs text-muted-foreground">Estructura geográfica y segmentación por industria</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Nombre del Territorio</label>
              <input
                type="text"
                required
                placeholder="Ej. Región Andina B2B"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Código Único</label>
              <input
                type="text"
                required
                placeholder="TERR-ANDES"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Países (Códigos ISO separados por coma)</label>
            <input
              type="text"
              placeholder="CO, PE, EC, MX"
              value={countriesText}
              onChange={(e) => setCountriesText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
            />
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Industrias Objetivo (separadas por coma)</label>
            <input
              type="text"
              placeholder="FINTECH, SAAS, RETAIL, BANKING"
              value={industriesText}
              onChange={(e) => setIndustriesText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
            />
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Cuota Objetivo Anual ($ USD)</label>
            <input
              type="number"
              required
              value={quotaTargetUsd}
              onChange={(e) => setQuotaTargetUsd(e.target.value)}
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
              <Sparkles size={14} /> {loading ? 'Guardando...' : 'Crear Territorio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
