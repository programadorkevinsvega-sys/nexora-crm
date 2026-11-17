'use client'

import React, { useState, useEffect } from 'react'
import type { BiReport, BiReportCategory } from '@crm/contracts'
import { ApiBiRepository } from '@src/infrastructure/crm/repositories/bi/api-bi.repository'
import { BiEmbedViewer } from './bi-embed-viewer'
import { CreateBiReportModal } from './create-bi-report-modal'
import { BarChart3, Plus, Sparkles, Layers, ShieldCheck, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'

export function BiDashboardPage() {
  const [reports, setReports] = useState<BiReport[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchReports = async () => {
    setLoading(true)
    try {
      const data = await ApiBiRepository.listReports()
      setReports(data)
      if (data.length > 0 && !selectedReportId) {
        setSelectedReportId(data[0].id)
      }
    } catch (err) {
      console.error('Error fetching BI reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const filteredReports = reports.filter((r) => {
    if (activeCategory === 'ALL') return true
    return r.category === activeCategory
  })

  const currentReport = reports.find((r) => r.id === selectedReportId) || reports[0]

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Power BI & Advanced Business Intelligence Hub
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Analítica avanzada, tableros interactivos de Microsoft Power BI y conector DirectQuery en tiempo real.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-all"
        >
          <Plus size={14} /> Conectar Reporte Power BI
        </button>
      </div>

      {/* Categories & Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { id: 'ALL', label: '📊 Todos los Dashboards' },
          { id: 'EXECUTIVE', label: '👑 Ejecutivo & Ingresos' },
          { id: 'SALES', label: '💼 Ventas & Pipeline' },
          { id: 'MARKETING', label: '📢 Marketing & Leads' },
          { id: 'SUPPORT', label: '🎫 Retención & CSAT' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Reports Horizontal Selector */}
      {filteredReports.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {filteredReports.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReportId(r.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold text-left shrink-0 transition-all border ${
                currentReport?.id === r.id
                  ? 'bg-card border-primary text-primary shadow-xs'
                  : 'bg-card/50 border-border text-muted-foreground hover:text-foreground hover:bg-card'
              }`}
            >
              {r.title}
            </button>
          ))}
        </div>
      )}

      {/* Embed Viewer */}
      {loading ? (
        <Skeleton className="h-[620px] w-full rounded-2xl" />
      ) : currentReport ? (
        <BiEmbedViewer report={currentReport} />
      ) : (
        <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-3">
          <p className="text-sm font-bold text-foreground">No hay dashboards configurados en esta categoría</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold"
          >
            + Conectar Primer Dashboard
          </button>
        </div>
      )}

      {showModal && (
        <CreateBiReportModal
          onClose={() => setShowModal(false)}
          onCreated={() => fetchReports()}
        />
      )}
    </div>
  )
}

export default BiDashboardPage
