'use client'

import React, { useState } from 'react'
import type { BiReport } from '@crm/contracts'
import { ExternalLink, RefreshCw, Database, Copy, Check } from 'lucide-react'
import { ApiBiRepository } from '@src/infrastructure/crm/repositories/bi/api-bi.repository'

interface Props {
  report: BiReport
}

export function BiEmbedViewer({ report }: Props) {
  const [copiedEntity, setCopiedEntity] = useState<string | null>(null)
  const [iframeKey, setIframeKey] = useState(0)

  const copyFeedUrl = (entity: string) => {
    const url = ApiBiRepository.getDataFeedUrl(entity)
    navigator.clipboard.writeText(url)
    setCopiedEntity(entity)
    setTimeout(() => setCopiedEntity(null), 2500)
  }

  return (
    <div className="space-y-4">
      {/* Report Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-base font-bold text-foreground">{report.title}</h2>
          <p className="text-xs text-muted-foreground">{report.description || 'Dashboard analítico interactivo'}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIframeKey((prev) => prev + 1)}
            title="Recargar reporte"
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={14} />
          </button>

          <a
            href={report.embedUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors"
          >
            <ExternalLink size={13} /> Abrir en Power BI
          </a>
        </div>
      </div>

      {/* Embed iFrame Container */}
      <div className="w-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[620px] relative">
        <iframe
          key={iframeKey}
          title={report.title}
          src={report.embedUrl}
          className="w-full h-[620px] border-0"
          allowFullScreen
        />
      </div>

      {/* Power BI Desktop Connector Box */}
      <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Database size={15} className="text-primary" />
          <span>Conector de Datos para Power BI Desktop (REST / OData Feed):</span>
        </div>
        <p className="text-muted-foreground text-[11px]">
          Usa estas URLs en Power BI Desktop (&gt; Obtener Datos &gt; Web o OData) para sincronizar directamente las tablas de tu CRM:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {['deals', 'contacts', 'tickets'].map((entity) => (
            <button
              key={entity}
              onClick={() => copyFeedUrl(entity)}
              className="px-2.5 py-1.5 bg-background border border-border rounded-lg flex items-center gap-1.5 text-xs hover:border-primary/50 transition-colors font-mono"
            >
              {copiedEntity === entity ? (
                <Check size={12} className="text-emerald-500" />
              ) : (
                <Copy size={12} className="text-muted-foreground" />
              )}
              <span>/api/bff/bi/feed/{entity}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
