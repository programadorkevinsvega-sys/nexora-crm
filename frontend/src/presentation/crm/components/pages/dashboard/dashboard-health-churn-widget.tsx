'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeartPulse, AlertTriangle, ShieldCheck, ArrowRight, PhoneCall, CheckCircle2 } from 'lucide-react'
import { ApiHealthScoreRepository } from '@src/infrastructure/crm/repositories/health-score/api-health-score.repository'
import type { CustomerHealthScore } from '@crm/contracts'

export function DashboardHealthChurnWidget() {
  const [scores, setScores] = useState<CustomerHealthScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ApiHealthScoreRepository.listAtRiskCustomers()
      .then((data) => setScores(data || []))
      .catch((err) => console.error('Failed to load health scores:', err))
      .finally(() => setLoading(false))
  }, [])

  const total = scores.length
  const healthyCount = scores.filter((s) => s.status === 'HEALTHY').length
  const neutralCount = scores.filter((s) => s.status === 'NEUTRAL').length
  const atRiskCount = scores.filter((s) => s.status === 'AT_RISK' || s.status === 'CRITICAL').length

  const healthyPct = total > 0 ? Math.round((healthyCount / total) * 100) : 100
  const neutralPct = total > 0 ? Math.round((neutralCount / total) * 100) : 0
  const atRiskPct = total > 0 ? Math.round((atRiskCount / total) * 100) : 0

  const urgentAccounts = scores.filter((s) => s.status === 'AT_RISK' || s.status === 'CRITICAL').slice(0, 3)

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
            <HeartPulse size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Prevención de Churn & Retención</h2>
            <p className="text-xs text-muted-foreground">Alertas tempranas calculadas por salud real de cuentas</p>
          </div>
        </div>

        <Link
          href="/contacts"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          Ver Todos <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 bg-emerald-500/10 rounded-lg">
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{healthyPct}%</div>
          <div className="text-[11px] text-muted-foreground">🟢 Saludables ({healthyCount})</div>
        </div>
        <div className="p-2.5 bg-amber-500/10 rounded-lg">
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{neutralPct}%</div>
          <div className="text-[11px] text-muted-foreground">🟡 Moderado ({neutralCount})</div>
        </div>
        <div className="p-2.5 bg-rose-500/10 rounded-lg">
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{atRiskPct}%</div>
          <div className="text-[11px] text-muted-foreground">🔴 En Riesgo ({atRiskCount})</div>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {urgentAccounts.length === 0 ? (
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span>Excelente: No hay cuentas con riesgo crítico de churn en este momento.</span>
          </div>
        ) : (
          urgentAccounts.map((acc, i) => (
            <div
              key={i}
              className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-rose-500" />
                  <span>Score {acc.healthScore}/100 ({acc.status})</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{acc.primaryRiskFactor || 'Riesgo detectado'}</p>
              </div>

              {acc.contactId && (
                <Link
                  href={`/contacts/${acc.contactId}/360`}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0"
                >
                  <PhoneCall size={12} /> Rescatar
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
