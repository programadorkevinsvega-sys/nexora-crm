'use client'

import React, { useState } from 'react'
import { ApiPrmRepository } from '@src/infrastructure/crm/repositories/prm/api-prm.repository'
import type { Partner } from '@crm/contracts'
import { X, Handshake, Sparkles, ShieldCheck } from 'lucide-react'

interface Props {
  partners: Partner[]
  onClose: () => void
  onCreated: () => void
}

export function RegisterPartnerDealModal({ partners, onClose, onCreated }: Props) {
  const [partnerId, setPartnerId] = useState(partners[0]?.id || '')
  const [prospectCompanyName, setProspectCompanyName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [estimatedValueUsd, setEstimatedValueUsd] = useState('25000')
  const [productCategory, setProductCategory] = useState('SAAS_ENTERPRISE')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerId || !prospectCompanyName || !contactEmail) return

    setLoading(true)
    try {
      await ApiPrmRepository.submitDealRegistration({
        partnerId,
        prospectCompanyName,
        contactEmail,
        estimatedValueUsd: Number(estimatedValueUsd) || 10000,
        productCategory,
        notes,
      })
      onCreated()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error al registrar deal para protección')
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
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Registro de Oportunidad (Deal Registration)</h3>
              <p className="text-xs text-muted-foreground">Protección de canal y comisión exclusiva por 90 días</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">Partner Solicitante</label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground font-bold"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  🤝 {p.partnerName} ({p.contactEmail})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Empresa Prospecto</label>
              <input
                type="text"
                required
                placeholder="Ej. Banco Santander Tech"
                value={prospectCompanyName}
                onChange={(e) => setProspectCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Email de Contacto</label>
              <input
                type="email"
                required
                placeholder="decision.maker@prospect.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Valor Estimado ($ USD)</label>
              <input
                type="number"
                required
                value={estimatedValueUsd}
                onChange={(e) => setEstimatedValueUsd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Línea de Solución</label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
              >
                <option value="SAAS_ENTERPRISE">SaaS Enterprise Suite</option>
                <option value="AI_COPILOT">AI & Voice Copilot</option>
                <option value="INTEGRATIONS_HUB">Custom Integrations</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Notas / Justificación de la Oportunidad</label>
            <textarea
              rows={2}
              placeholder="Detalles sobre el requerimiento y fase actual..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              <Sparkles size={14} /> {loading ? 'Protegiendo Deal...' : 'Registrar Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
