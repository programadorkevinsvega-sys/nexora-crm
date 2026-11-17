'use client'

import React from 'react'
import type { SalesTerritory } from '@crm/contracts'
import { MapPin, Target, Users, Globe, Building2, ChevronRight } from 'lucide-react'

interface Props {
  territory: SalesTerritory
}

export function TerritoryCard({ territory }: Props) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                {territory.code}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                🟢 Activo
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">{territory.name}</h3>
          </div>

          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <MapPin size={18} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {territory.description || 'Zona comercial corporativa asignada.'}
        </p>

        {/* Countries & Industries Badges */}
        <div className="space-y-2 text-xs">
          <div className="flex flex-wrap gap-1.5 items-center">
            <Globe size={12} className="text-muted-foreground" />
            {territory.countryCodes.map((c) => (
              <span key={c} className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 font-bold text-[10px]">
                {c}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            <Building2 size={12} className="text-muted-foreground" />
            {territory.industries.map((ind) => (
              <span key={ind} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 font-medium text-[10px]">
                {ind}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Quota Target */}
      <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] text-muted-foreground">Cuota Objetivo Regional:</span>
          <p className="text-sm font-bold text-foreground flex items-center gap-1">
            <Target size={13} className="text-emerald-500" />
            ${territory.quotaTargetUsd.toLocaleString()} USD
          </p>
        </div>

        <button className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs font-bold text-foreground flex items-center gap-1 transition-colors">
          Gestionar <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
