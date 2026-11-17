'use client'

import React, { useState } from 'react'
import { ApiPriceBooksRepository } from '@src/infrastructure/crm/repositories/price-books/api-price-books.repository'
import type { CurrencyCode } from '@crm/contracts'
import { X, DollarSign, Sparkles } from 'lucide-react'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function CreatePriceBookModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('USD')
  const [description, setDescription] = useState('')
  const [isStandard, setIsStandard] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code) return

    setLoading(true)
    try {
      await ApiPriceBooksRepository.createPriceBook({
        name,
        code: code.toUpperCase(),
        currency,
        description,
        isStandard,
        isActive: true,
      })
      onCreated()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error al crear lista de precios')
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
              <DollarSign size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Crear Lista de Precios (Price Book)</h3>
              <p className="text-xs text-muted-foreground">Catálogo de precios diferenciados multi-moneda</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Nombre de la Lista</label>
              <input
                type="text"
                required
                placeholder="Ej. Tarifa Mayorista 2026"
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
                placeholder="PB-MAYORISTA"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Moneda / Divisa</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground font-bold"
            >
              <option value="USD">💵 USD — Dólares Americanos</option>
              <option value="COP">🇨🇴 COP — Pesos Colombianos</option>
              <option value="MXN">🇲🇽 MXN — Pesos Mexicanos</option>
              <option value="EUR">💶 EUR — Euros</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Descripción</label>
            <textarea
              rows={2}
              placeholder="Condiciones comerciales y segmento aplicable..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isStandard"
              checked={isStandard}
              onChange={(e) => setIsStandard(e.target.checked)}
              className="rounded border"
            />
            <label htmlFor="isStandard" className="text-foreground font-medium cursor-pointer">
              Definir como Lista Estándar por Defecto
            </label>
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
              <Sparkles size={14} /> {loading ? 'Guardando...' : 'Crear Price Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
