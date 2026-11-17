"use client"

import { useState, useEffect } from "react"
import { Sparkles, TrendingUp, Calendar, Zap, ArrowUpRight } from "lucide-react"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiAnalyticsRepository } from "@/src/infrastructure/crm/repositories/analytics/api-analytics.repository"
import type { RevenueForecast } from "@crm/contracts"

export function ForecastingTab() {
  const [horizon, setHorizon] = useState<"3M" | "6M">("3M")
  const [forecast, setForecast] = useState<RevenueForecast | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ApiAnalyticsRepository.getForecast(horizon)
      .then((data) => {
        if (mounted) setForecast(data)
      })
      .catch((err) => console.error("Error fetching forecast:", err))
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [horizon])

  if (loading || !forecast) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const maxVal = Math.max(...(forecast.dataPoints || []).map((p) => p.optimisticRevenue), 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/30 p-4 rounded-xl border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-500 animate-pulse" />
          <div>
            <h3 className="font-semibold text-sm">Modelo Predictivo de Ingresos (Algorítmico + Pipeline Velocity)</h3>
            <p className="text-xs text-muted-foreground">Proyección cruzando metas comerciales con velocidad histórica de cierre.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-background p-1 rounded-lg border">
          <Button
            size="sm"
            variant={horizon === "3M" ? "default" : "ghost"}
            className="text-xs h-7 px-3"
            onClick={() => setHorizon("3M")}
          >
            Próximos 3 Meses
          </Button>
          <Button
            size="sm"
            variant={horizon === "6M" ? "default" : "ghost"}
            className="text-xs h-7 px-3"
            onClick={() => setHorizon("6M")}
          >
            Próximos 6 Meses
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-cyan-500 bg-card/60">
          <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Pronóstico Total {horizon}</span>
            <TrendingUp className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            ${(horizon === "3M" ? forecast.totalForecast3M : forecast.totalForecast6M).toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Base histórica: ${forecast.baseRevenue.toLocaleString()}/mes</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 bg-card/60">
          <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Velocidad del Pipeline</span>
            <Zap className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            ${forecast.pipelineVelocity.toLocaleString()} <span className="text-xs font-normal">/día</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Generación de valor por día de ciclo</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500 bg-card/60">
          <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Win Rate Histórico</span>
            <ArrowUpRight className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{forecast.winRate}%</div>
          <p className="text-[11px] text-muted-foreground mt-1">Efectividad de cierre en Deals</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 bg-card/60">
          <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Ciclo Promedio de Venta</span>
            <Calendar className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{forecast.avgSalesCycleDays} días</div>
          <p className="text-[11px] text-muted-foreground mt-1">Desde creación hasta cierre WON</p>
        </Card>
      </div>

      <Card className="p-5">
        <h4 className="font-semibold text-sm mb-4 flex items-center justify-between">
          <span>Proyección Mensual: Pesimista vs Esperado vs Optimista</span>
          <span className="text-xs text-muted-foreground font-normal">Moneda: {forecast.currency}</span>
        </h4>

        <div className="space-y-4">
          {(forecast.dataPoints || []).slice(0, horizon === "3M" ? 3 : 6).map((dp) => {
            const expectedPct = Math.round((dp.forecastedRevenue / maxVal) * 100)
            const optPct = Math.round((dp.optimisticRevenue / maxVal) * 100)
            const pesPct = Math.round((dp.pessimisticRevenue / maxVal) * 100)

            return (
              <div key={dp.month} className="p-3.5 rounded-lg bg-muted/20 border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{dp.month}</span>
                    <Badge variant="info" className="text-[10px]">
                      Confianza {dp.confidence}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-rose-500">Min: ${dp.pessimisticRevenue.toLocaleString()}</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">Esperado: ${dp.forecastedRevenue.toLocaleString()}</span>
                    <span className="text-emerald-500">Max: ${dp.optimisticRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex relative">
                  <div style={{ width: `${pesPct}%` }} className="h-full bg-rose-500/40" title="Pesimista" />
                  <div style={{ width: `${Math.max(0, expectedPct - pesPct)}%` }} className="h-full bg-cyan-500" title="Esperado" />
                  <div style={{ width: `${Math.max(0, optPct - expectedPct)}%` }} className="h-full bg-emerald-500/50" title="Optimista" />
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
