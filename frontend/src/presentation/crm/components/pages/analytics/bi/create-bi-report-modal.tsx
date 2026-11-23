'use client'

import React, { useState } from 'react'
import { ApiBiRepository } from '@src/infrastructure/crm/repositories/bi/api-bi.repository'
import type { BiReportCategory } from '@crm/contracts'
import { X, BarChart3, Sparkles } from 'lucide-react'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function CreateBiReportModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<BiReportCategory>('SALES')
  const [embedUrl, setEmbedUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !embedUrl) return

    setLoading(true)
    try {
      await ApiBiRepository.createReport({
        title,
        description,
        category,
        embedUrl,
        embedType: 'POWER_BI_WEB',
        refreshSchedule: 'REALTIME',
        isDefault: false,
      })
      onCreated()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error al conectar el reporte de Power BI')
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
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Conectar Reporte de Power BI</h3>
              <p className="text-xs text-muted-foreground">Incrusta dashboards interactivos de Microsoft Power BI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">Título del Dashboard</label>
            <input
              type="text"
              required
              placeholder="Ej. Análisis de Ventas B2B & Proyecciones"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
            />
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BiReportCategory)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground"
            >
              <option value="SALES">💼 Ventas & Pipeline</option>
              <option value="EXECUTIVE">👑 Ejecutivo & MRR</option>
              <option value="MARKETING">📢 Marketing & Ads</option>
              <option value="SUPPORT">🎫 Soporte & CSAT</option>
              <option value="FINANCE">💰 Finanzas & Cobros</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">URL de Incrustación (Embed / Publish to Web)</label>
            <input
              type="url"
              required
              placeholder="https://app.powerbi.com/view?r=..."
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground font-mono text-[11px]"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Obtenida desde Power BI Service &gt; Archivo &gt; Insertar informe &gt; Publicar en la web o Sitio web/portal.
            </p>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Descripción (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Detalles sobre las métricas y fuentes analizadas en este reporte..."
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
              <Sparkles size={14} /> {loading ? 'Conectando...' : 'Guardar Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
