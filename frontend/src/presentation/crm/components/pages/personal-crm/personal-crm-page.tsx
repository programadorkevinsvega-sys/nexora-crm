"use client"

import { useState, useEffect } from "react"
import {
  Heart,
  Cake,
  Gift,
  Clock,
  Plus,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
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
        prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
      )
    } catch (err) {
      console.error("Toggle reminder error:", err)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" /> Personal CRM & Fidelización Humana
          </h1>
          <p className="text-xs text-muted-foreground">
            Fechas especiales, cumpleaños de clientes, ideas de regalos VIP y recordatorios de periodicidad.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Actualizar
        </Button>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-muted/20 border flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600">
            <Cake className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Eventos & Cumpleaños</div>
            <div className="text-xl font-bold text-foreground">{events.length}</div>
          </div>
        </Card>
        <Card className="p-4 bg-muted/20 border flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Ideas de Regalos VIP</div>
            <div className="text-xl font-bold text-foreground">{gifts.length}</div>
          </div>
        </Card>
        <Card className="p-4 bg-muted/20 border flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Recordatorios Activos</div>
            <div className="text-xl font-bold text-foreground">{reminders.filter((r) => !r.completed).length}</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { id: "EVENTS", label: "🎂 Cumpleaños & Fechas Clave", icon: Cake },
          { id: "GIFTS", label: "🎁 Ideas de Regalos VIP", icon: Gift },
          { id: "REMINDERS", label: "⏰ Recordatorios de Contacto", icon: Clock },
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

      {/* Content */}
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
                      {e.type}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3" /> {new Date(e.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{e.title}</h3>
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
                    {g.price && <span className="font-bold font-mono text-xs text-emerald-600">${g.price}</span>}
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{g.name}</h3>
                  {g.occasion && <p className="text-xs text-muted-foreground">Ocasión: {g.occasion}</p>}
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
                  r.completed ? "bg-muted/10 opacity-70" : "bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleReminder(r.id)}
                    className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                      r.completed ? "bg-emerald-500 text-white border-emerald-500" : "border-input hover:border-primary"
                    }`}
                  >
                    {r.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                  <div>
                    <p className={`text-xs font-semibold ${r.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {r.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Vence: {new Date(r.dueDate).toLocaleDateString()}
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
