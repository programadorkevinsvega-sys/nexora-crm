"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  DollarSign,
  Filter,
  BarChart3,
  Users,
  Percent,
  Calendar,
  Zap,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiAnalyticsRepository } from "@/src/infrastructure/crm/repositories/analytics/api-analytics.repository"
import type { RevenueMetrics, FunnelMetrics, CohortMetrics } from "@crm/contracts"

export function RevenueAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"REVENUE" | "FUNNEL" | "COHORTS">("REVENUE")
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null)
  const [funnel, setFunnel] = useState<FunnelMetrics | null>(null)
  const [cohorts, setCohorts] = useState<CohortMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [rev, fnl, chs] = await Promise.all([
        ApiAnalyticsRepository.getRevenueMetrics(),
        ApiAnalyticsRepository.getFunnelMetrics(),
        ApiAnalyticsRepository.getCohortMetrics(),
      ])
      setRevenue(rev)
      setFunnel(fnl)
      setCohorts(chs)
    } catch (err) {
      console.error("Failed to load analytics:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto p-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Analítica Avanzada de Ingresos & Funnels
          </h1>
          <p className="text-xs text-muted-foreground">
            Métricas SaaS en tiempo real: MRR, ARR, LTV/CAC, Funnel con Tasa de Abandono y Cohortes de Retención.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Actualizar Datos
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { id: "REVENUE", label: "💵 Ingresos & Métricas SaaS", icon: DollarSign },
          { id: "FUNNEL", label: "🔻 Funnels de Conversión & Abandono", icon: Filter },
          { id: "COHORTS", label: "👥 Matriz de Cohortes de Retención", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              size="sm"
              variant={activeTab === tab.id ? "default" : "outline"}
              className="text-xs"
              onClick={() => setActiveTab(tab.id as any)}
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {tab.label}
            </Button>
          )
        })}
      </div>

      {/* Tab 1: Revenue Metrics */}
      {activeTab === "REVENUE" && revenue && (
        <div className="space-y-6">
          {/* Top Revenue Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4 bg-muted/20 border">
              <div className="text-xs text-muted-foreground">ARR (Ingreso Anual)</div>
              <div className="text-xl font-bold text-foreground mt-1">
                ${revenue.totalArr.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">USD</span>
              </div>
            </Card>
            <Card className="p-4 bg-muted/20 border">
              <div className="text-xs text-muted-foreground">MRR (Ingreso Mensual)</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                ${revenue.totalMrr.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/mes</span>
              </div>
            </Card>
            <Card className="p-4 bg-muted/20 border">
              <div className="text-xs text-muted-foreground">Net New MRR</div>
              <div className="text-xl font-bold text-primary mt-1">
                +${revenue.netNewMrr.toLocaleString()}
              </div>
            </Card>
            <Card className="p-4 bg-muted/20 border">
              <div className="text-xs text-muted-foreground">Sales Velocity (Velocidad de Ventas)</div>
              <div className="text-xl font-bold text-amber-600 mt-1 flex items-center gap-1">
                <Zap className="h-4 w-4" /> ${revenue.salesVelocityPerDay.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/día</span>
              </div>
            </Card>
          </div>

          {/* MRR Waterfall & Economics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-foreground">Desglose de Movimientos MRR (Waterfall)</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="flex items-center gap-1"><ArrowUpRight className="h-3.5 w-3.5" /> New MRR (Nuevos Clientes)</span>
                  <span className="font-bold font-mono">+${revenue.newMrr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
                  <span className="flex items-center gap-1"><ArrowUpRight className="h-3.5 w-3.5" /> Expansion MRR (Upgrades)</span>
                  <span className="font-bold font-mono">+${revenue.expansionMrr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                  <span className="flex items-center gap-1"><ArrowDownRight className="h-3.5 w-3.5" /> Contraction MRR (Downgrades)</span>
                  <span className="font-bold font-mono">-${revenue.contractionMrr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <span className="flex items-center gap-1"><ArrowDownRight className="h-3.5 w-3.5" /> Churned MRR (Cancelaciones)</span>
                  <span className="font-bold font-mono">-${revenue.churnedMrr.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-foreground">Unit Economics & Eficiencia Comercial</h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 border rounded bg-muted/20">
                  <div className="text-muted-foreground text-[11px]">Customer Lifetime Value (LTV)</div>
                  <div className="text-base font-bold text-foreground mt-0.5">${revenue.ltv.toLocaleString()}</div>
                </div>
                <div className="p-2.5 border rounded bg-muted/20">
                  <div className="text-muted-foreground text-[11px]">Customer Acquisition Cost (CAC)</div>
                  <div className="text-base font-bold text-foreground mt-0.5">${revenue.cac.toLocaleString()}</div>
                </div>
                <div className="p-2.5 border rounded bg-muted/20">
                  <div className="text-muted-foreground text-[11px]">Ratio LTV / CAC</div>
                  <div className="text-base font-bold text-foreground mt-0.5 flex items-center gap-1">
                    {revenue.ltvCacRatio > 0 ? (
                      <>
                        <span className="text-emerald-600">{revenue.ltvCacRatio}x</span>
                        {revenue.ltvCacRatio >= 3 && <Badge variant="secondary" className="text-[10px]">Saludable (&gt;3x)</Badge>}
                      </>
                    ) : (
                      <span className="text-muted-foreground text-xs font-normal">Sin cerrar ventas</span>
                    )}
                  </div>
                </div>
                <div className="p-2.5 border rounded bg-muted/20">
                  <div className="text-muted-foreground text-[11px]">Win Rate (Tasa de Cierre)</div>
                  <div className="text-base font-bold text-primary mt-0.5">{revenue.winRatePercent}%</div>
                </div>
                <div className="p-2.5 border rounded bg-muted/20">
                  <div className="text-muted-foreground text-[11px]">Ticket Promedio (Deal Size)</div>
                  <div className="text-base font-bold text-foreground mt-0.5">${revenue.avgDealSize.toLocaleString()}</div>
                </div>
                <div className="p-2.5 border rounded bg-muted/20">
                  <div className="text-muted-foreground text-[11px]">Ciclo de Venta Promedio</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {revenue.avgSalesCycleDays > 0 ? `${revenue.avgSalesCycleDays} días` : '—'}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Funnel Metrics with Drop-off */}
      {activeTab === "FUNNEL" && funnel && (
        <Card className="p-5 border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Embudo de Ventas con Tasa de Abandono (Drop-off Analysis)</h2>
            <Badge variant="outline" className="font-mono text-xs">Conversión Global: {funnel.overallConversionRatePercent}%</Badge>
          </div>
          <div className="space-y-3">
            {funnel.stages.map((stage) => (
              <div key={stage.stageIndex} className="p-3 border rounded-lg bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>{stage.stageName}</span>
                  <div className="flex items-center gap-4">
                    {stage.totalValue > 0 && <span className="font-mono text-emerald-600">${stage.totalValue.toLocaleString()} USD</span>}
                    <span className="font-bold">{stage.count} registros</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden flex">
                    <div className="bg-primary h-full transition-all" style={{ width: `${stage.conversionRatePercent}%` }} />
                  </div>
                  <div className="flex items-center gap-2 min-w-32 justify-end text-[11px]">
                    <span className="text-emerald-600 font-bold">{stage.conversionRatePercent}% conv.</span>
                    {stage.stageIndex > 1 && (
                      <span className="text-rose-600 font-bold">({stage.dropOffRatePercent}% fuga)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Retention Cohorts Matrix */}
      {activeTab === "COHORTS" && cohorts && (
        <Card className="p-5 border shadow-sm space-y-4 overflow-x-auto">
          <h2 className="text-sm font-bold text-foreground">Matriz de Retención por Cohortes de Adquisición</h2>
          {cohorts.cohorts.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
              No hay cohortes de clientes cerrados aún en este tenant. Registra oportunidades (Deals) con estado WON para ver la evolución de retención mensual real.
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="p-2.5">Cohorte</th>
                  <th className="p-2.5">Clientes</th>
                  <th className="p-2.5">MRR Inicial</th>
                  {["Mes 0", "Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5", "Mes 6"].map((m) => (
                    <th key={m} className="p-2.5 text-center">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {cohorts.cohorts.map((row) => (
                  <tr key={row.cohortMonth} className="hover:bg-muted/20">
                    <td className="p-2.5 font-bold font-mono">{row.cohortMonth}</td>
                    <td className="p-2.5">{row.totalCustomers}</td>
                    <td className="p-2.5 font-mono font-semibold text-emerald-600">${row.initialMrr.toLocaleString()}</td>
                    {row.retentionRates.map((rate, idx) => (
                      <td key={idx} className="p-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded text-[11px] font-bold font-mono ${
                            rate >= 90
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              : rate >= 80
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

    </div>
  )
}
