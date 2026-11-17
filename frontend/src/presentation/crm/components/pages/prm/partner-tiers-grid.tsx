'use client'

import React from 'react'
import type { PartnerTier } from '@crm/contracts'
import { Check } from 'lucide-react'

interface Props {
  tiers: PartnerTier[]
}

export function PartnerTiersGrid({ tiers }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-foreground">Niveles de Certificación y Beneficios</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiers.map((t) => (
          <div key={t.id} className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-foreground">
                {t.name}
              </span>
              <span className="text-xs font-bold text-emerald-600">Margen: {t.discountMarginPct}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Fondo MDF: <strong>${t.mdfAllowanceUsd.toLocaleString()} USD</strong>
            </p>
            <ul className="text-[11px] space-y-1 text-muted-foreground">
              {t.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500" /> {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
