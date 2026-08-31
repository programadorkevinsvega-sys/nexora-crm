"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, Zap, Target, Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiAnalyticsRepository } from "@/src/infrastructure/crm/repositories/analytics/api-analytics.repository"
import type { RevenueForecast } from "@crm/contracts"

export function ForecastingPage() {
  const [horizon, setHorizon] = useState<"3M" | "6M">("3M")
  const [data, setData] = useState<RevenueForecast | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await ApiAnalyticsRepository.getForecast(horizon)
      setData(result)
    } catch (err) {
      console.error("Failed to load forecast:", err)
    } finally {
      setLoading(false)
    }
  }, [horizon])

  useEffect(() => { loadData() }, [loadData])

  const visiblePoints = data ? (horizon === "3M" ? data.dataPoints.slice(0, 3) : data.dataPoints) : []
  const maxRevenue = visiblePoints.reduce((m, p) => Math.max(m, p.optimisticRevenue), 1)

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto p-4">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Forecasting Trimestral de Ingresos
          </h1>
          <p className="text-xs text-muted-foreground">Proyección lineal con escenarios optimista, base y pesimista.</p>
        </div>
        <div className="flex items-center gap-2">
          {(["3M", "6M"] as const).map((h) => (
            <Button key={h} size="sm" variant={horizon === h ? "default" : "outline"} onClick={() => setHorizon(h)}>{h}</Button>
          ))}
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Forecast 3M", value: `$${data.totalForecast3M.toLocaleString()}`, icon: Calendar, color: "text-primary" },
              { label: "Forecast 6M", value: `$${data.totalForecast6M.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600" },
              { label: "Pipeline Velocity", value: `$${data.pipelineVelocity.toLocaleString()}/día`, icon: Zap, color: "text-amber-600" },
              { label: "Win Rate / Ciclo", value: `${data.winRate}% · ${data.avgSalesCycleDays}d`, icon: Target, color: "text-sky-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="p-4 bg-muted/20 border">
                <div className="text-xs text-muted-foreground flex items-center gap-1"><Icon className="h-3.5 w-3.5" />{label}</div>
                <div className={`text-lg font-bold mt-1 ${color}`}>{value}</div>
              </Card>
            ))}
          </div>

          <Card className="p-5 border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Proyección Mes a Mes — Horizonte {horizon}</h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-500/70" /> Optimista</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-cyan-500/70" /> Base</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-orange-500/70" /> Pesimista</span>
              </div>
            </div>
            <div className="space-y-4">
              {visiblePoints.map((pt) => (
                <div key={pt.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-foreground">{pt.month}</span>
                    <Badge variant="info" className="text-[10px]">{pt.confidence}% confianza</Badge>
                  </div>
                  {[
                    { label: "Optimista", val: pt.optimisticRevenue, bg: "bg-green-500/70" },
                    { label: "Base", val: pt.forecastedRevenue, bg: "bg-cyan-500/70" },
                    { label: "Pesimista", val: pt.pessimisticRevenue, bg: "bg-orange-500/70" },
                  ].map(({ label, val, bg }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <span className="w-16 text-right text-muted-foreground">{label}</span>
                      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                        <div className={`${bg} h-full rounded-full transition-all`} style={{ width: `${Math.min(100, (val / maxRevenue) * 100)}%` }} />
                      </div>
                      <span className="w-20 font-mono text-foreground font-semibold">${val.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
