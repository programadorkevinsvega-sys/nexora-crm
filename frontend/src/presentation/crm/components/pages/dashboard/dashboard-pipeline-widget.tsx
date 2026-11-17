'use client'

import React from 'react'
import Link from 'next/link'
import { TrendingUp, ArrowRight, BarChart3, Layers, Plus } from 'lucide-react'

interface Props {
  deals: any[]
  loading?: boolean
}

export function DashboardPipelineWidget({ deals, loading }: Props) {
  const totalDeals = deals.length
  const totalValue = deals.reduce((acc, d) => acc + (Number(d.value) || 0), 0)
  const wonDeals = deals.filter((d) => d.status === 'WON').length
  const winRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : '0.0'

  const stagesMap = new Map<string, { count: number; value: number }>()
  deals.forEach((d) => {
    const stageName = d.stageName || d.stage || d.status || 'Etapa Activa'
    const curr = stagesMap.get(stageName) || { count: 0, value: 0 }
    curr.count += 1
    curr.value += Number(d.value) || 0
    stagesMap.set(stageName, curr)
  })

  const stages = Array.from(stagesMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    value: `$${data.value.toLocaleString()}`,
    pct: totalValue > 0 ? Math.round((data.value / totalValue) * 100) : 0,
  }))

  const colors = ['bg-indigo-500', 'bg-sky-500', 'bg-amber-500', 'bg-purple-500', 'bg-emerald-500']

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Embudo Comercial & Pipeline Velocity</h2>
            <p className="text-xs text-muted-foreground">Distribución real de oportunidades en el ciclo de ventas</p>
          </div>
        </div>

        <Link
          href="/pipelines"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          Ver Tablero Kanban <ArrowRight size={13} />
        </Link>
      </div>

      {stages.length === 0 && !loading ? (
        <div className="p-8 text-center space-y-2 border border-dashed border-border rounded-xl">
          <p className="text-xs text-muted-foreground">No hay oportunidades registradas en el pipeline</p>
          <Link
            href="/pipelines/deals/new"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold"
          >
            <Plus size={13} /> Crear Primer Deal
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map((st, i) => (
            <div key={i} className="space-y-1 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span className="text-foreground">{st.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{st.count} deals</span>
                  <span className="font-bold text-foreground">{st.value}</span>
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(5, st.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-500" />
          <span>Win Rate Real: <strong className="text-foreground">{winRate}%</strong></span>
        </div>
        <Link href="/analytics/forecast" className="text-primary hover:underline font-semibold flex items-center gap-1">
          <BarChart3 size={13} /> Ver Forecasting 3M/6M
        </Link>
      </div>
    </div>
  )
}
