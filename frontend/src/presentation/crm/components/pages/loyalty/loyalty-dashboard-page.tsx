"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Star,
  Award,
  Crown,
  Sparkles,
  Users,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus,
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import {
  ApiLoyaltyRepository,
} from "@/src/infrastructure/crm/repositories/loyalty/api-loyalty.repository"
import type { CustomerSegment } from "@/src/domain/crm/loyalty/customer-segment.entity"

export function LoyaltyDashboardPage() {
  const router = useRouter()
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await ApiLoyaltyRepository.listSegments()
      setSegments(data)
    } catch (err) {
      console.error("Failed to load loyalty data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> Programa de Fidelización & Puntos
          </h1>
          <p className="text-xs text-muted-foreground">
            Gestión de niveles de lealtad, acumulación y canje de puntos por compras y transacciones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Actualizar
          </Button>
          <Button size="sm" onClick={() => router.push("/loyalty/segments")}>
            <Layers className="h-3.5 w-3.5 mr-1.5" /> Ver Segmentos
          </Button>
        </div>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border bg-gradient-to-br from-amber-900/10 to-amber-600/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Nivel Bronce</span>
            <Award className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-foreground">0 - 500 <span className="text-xs font-normal text-muted-foreground">pts</span></div>
          <p className="text-[11px] text-muted-foreground">Beneficio: 1x puntos en compras y promociones básicas.</p>
        </Card>

        <Card className="p-4 border bg-gradient-to-br from-slate-500/10 to-slate-400/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nivel Plata</span>
            <Award className="h-5 w-5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-foreground">501 - 2,000 <span className="text-xs font-normal text-muted-foreground">pts</span></div>
          <p className="text-[11px] text-muted-foreground">Beneficio: 1.25x puntos, soporte prioritario en Helpdesk.</p>
        </Card>

        <Card className="p-4 border bg-gradient-to-br from-yellow-500/15 to-yellow-600/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-500">Nivel Oro</span>
            <Crown className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-xl font-bold text-foreground">2,001 - 5,000 <span className="text-xs font-normal text-muted-foreground">pts</span></div>
          <p className="text-[11px] text-muted-foreground">Beneficio: 1.5x puntos, descuentos exclusivos en Cotizaciones.</p>
        </Card>

        <Card className="p-4 border bg-gradient-to-br from-cyan-500/15 to-blue-600/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">Nivel Platino</span>
            <Sparkles className="h-5 w-5 text-cyan-500" />
          </div>
          <div className="text-xl font-bold text-foreground">&gt; 5,000 <span className="text-xs font-normal text-muted-foreground">pts</span></div>
          <p className="text-[11px] text-muted-foreground">Beneficio: Ejecutivo comercial dedicado y recompensas VIP.</p>
        </Card>
      </div>

      {/* Segments Section */}
      <Card className="p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Segmentos Dinámicos de Clientes</h2>
            <p className="text-xs text-muted-foreground">Grupos automatizados por comportamiento y rango de puntos.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/loyalty/segments")}>
            Administrar Segmentos <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : segments.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-2 bg-muted/10 rounded-lg border border-dashed">
            <Users className="h-6 w-6 mx-auto text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No hay segmentos creados aún</p>
            <p>Crea segmentos para agrupar automáticamente a tus clientes según sus puntos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {segments.map((s: any) => (
              <div key={s.id} className="p-3.5 border rounded-lg bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">{s.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {s.isDynamic ? "Segmento Dinámico" : "Segmento Fijo"}
                  </Badge>
                </div>
                {s.description && <p className="text-[11px] text-muted-foreground">{s.description}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
