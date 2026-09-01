"use client"

import { useState, useEffect } from "react"
import {
  Cake,
  Gift,
  Clock,
  Plus,
  Calendar,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import {
  ApiPersonalCrmRepository,
  LifeEvent,
  GiftIdea,
  RelationshipReminder,
} from "@/src/infrastructure/crm/repositories/personal-crm/api-personal-crm.repository"

export function PersonalCrmPage() {
  const [activeTab, setActiveTab] = useState<"EVENTS" | "GIFTS" | "REMINDERS">("EVENTS")
  const [events, setEvents] = useState<LifeEvent[]>([])
  const [gifts, setGifts] = useState<GiftIdea[]>([])
  const [reminders, setReminders] = useState<RelationshipReminder[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [evRes, gfRes, rmRes] = await Promise.all([
        ApiPersonalCrmRepository.listLifeEvents(),
        ApiPersonalCrmRepository.listGifts(),
        ApiPersonalCrmRepository.listReminders(),
      ])
      setEvents(evRes.data || [])
      setGifts(gfRes.data || [])
      setReminders(rmRes.data || [])
    } catch (err) {
      console.error("Failed to load Personal CRM data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleReminder = async (id: string) => {
    try {
      await ApiPersonalCrmRepository.toggleReminder(id)
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
      )
    } catch (err) {
      console.error("Failed to toggle reminder:", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            CRM Personal y Vínculo Humano
          </h1>
          <p className="text-xs text-muted-foreground">
            Gestión de momentos clave, aniversarios, ideas de obsequios y cadencias de contacto para estrechar relaciones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-1 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button size="sm" className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Nuevo Registro
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("EVENTS")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "EVENTS"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Cake className="h-3.5 w-3.5" /> Eventos de Vida ({events.length})
        </button>
        <button
          onClick={() => setActiveTab("GIFTS")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "GIFTS"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Gift className="h-3.5 w-3.5" /> Ideas de Regalos ({gifts.length})
        </button>
        <button
          onClick={() => setActiveTab("REMINDERS")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "REMINDERS"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Clock className="h-3.5 w-3.5" /> Recordatorios ({reminders.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : activeTab === "EVENTS" ? (
        <div className="space-y-4">
          {events.length === 0 ? (
            <Card className="p-12 text-center text-xs text-muted-foreground space-y-2 border-dashed">
              <Cake className="h-8 w-8 mx-auto text-rose-500/50" />
              <p className="font-semibold text-foreground">No hay eventos de vida registrados</p>
              <p>Registra fechas de cumpleaños, aniversarios de empresa o hitos comerciales desde el perfil del contacto.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((e) => (
                <Card key={e.id} className="p-4 border shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">
                      {e.eventType}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3" /> {e.happenedAt ? new Date(e.happenedAt).toLocaleDateString() : "Periódico"}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{e.name}</h3>
                  {e.description && <p className="text-xs text-muted-foreground">{e.description}</p>}
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "GIFTS" ? (
        <div className="space-y-4">
          {gifts.length === 0 ? (
            <Card className="p-12 text-center text-xs text-muted-foreground space-y-2 border-dashed">
              <Gift className="h-8 w-8 mx-auto text-amber-500/50" />
              <p className="font-semibold text-foreground">No hay ideas de regalos guardadas</p>
              <p>Guarda sugerencias de regalos personalizados para tus clientes de mayor valor comercial.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gifts.map((g) => (
                <Card key={g.id} className="p-4 border shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                      {g.status}
                    </Badge>
                    {g.estimatedValue != null && <span className="font-bold font-mono text-xs text-emerald-600">${g.estimatedValue}</span>}
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{g.name}</h3>
                  {g.description && <p className="text-xs text-muted-foreground">{g.description}</p>}
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <Card className="p-12 text-center text-xs text-muted-foreground space-y-2 border-dashed">
              <Clock className="h-8 w-8 mx-auto text-sky-500/50" />
              <p className="font-semibold text-foreground">No hay recordatorios pendientes</p>
              <p>Configura frecuencias de contacto para no perder el vínculo con tus clientes clave.</p>
            </Card>
          ) : (
            reminders.map((r) => (
              <Card
                key={r.id}
                className={`p-3.5 border flex items-center justify-between transition-colors ${
                  !r.isActive ? "bg-muted/10 opacity-70" : "bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleReminder(r.id)}
                    className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                      !r.isActive ? "bg-emerald-500 text-white border-emerald-500" : "border-input hover:border-primary"
                    }`}
                  >
                    {!r.isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                  <div>
                    <p className={`text-xs font-semibold ${!r.isActive ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {r.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Vence: {r.nextDueDate ? new Date(r.nextDueDate).toLocaleDateString() : r.frequencyType}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
