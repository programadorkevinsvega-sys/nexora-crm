"use client"

import React from "react"
import { Layers, RefreshCw, FileText, CheckCircle, ExternalLink, Flame } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import type { MetaLeadForm } from "@crm/contracts"

interface MetaFormsSyncProps {
  forms: MetaLeadForm[]
  onSync: () => void
  isSyncing: boolean
  lastSyncAt?: string | null
}

export function MetaFormsSync({
  forms,
  onSync,
  isSyncing,
  lastSyncAt,
}: MetaFormsSyncProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">Formularios de Lead Ads en Facebook</h4>
            <p className="text-xs text-zinc-400">
              Formularios nativos sincronizados desde tu Página de Facebook
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastSyncAt && (
            <span className="text-[11px] text-zinc-400">
              Última sincronización: {new Date(lastSyncAt).toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={isSyncing}
            className="gap-2 text-xs text-cyan-300 border-cyan-800/40 hover:bg-cyan-950/30"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sincronizando..." : "Sincronizar Formularios"}
          </Button>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl space-y-2">
          <p className="text-xs text-zinc-400">No hay formularios sincronizados aún.</p>
          <Button variant="outline" size="sm" onClick={onSync} disabled={isSyncing}>
            Cargar Formularios desde Meta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {forms.map((form) => (
            <div
              key={form.formId}
              className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-blue-500/30 transition space-y-2.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                  <h5 className="text-xs font-semibold text-zinc-100 line-clamp-1">{form.formName}</h5>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {form.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                <span className="text-[11px] font-mono">ID: {form.formId}</span>
                <span className="font-semibold text-cyan-400 flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  {form.leadsCount} leads
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
